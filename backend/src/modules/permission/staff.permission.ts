import { prisma } from "../../config/database";
import { BadRequestError, NotFoundError, ForbiddenError } from "../../utils/error";

const verifyCanManagePermissions = async (operatorId: string): Promise<void> => {
  const operator = await prisma.staff.findUnique({
    where: { id: operatorId },
    select: {
      isSAdmin: true,
      staffPermissions: {
        select: {
          permission: { select: { code: true } },
        },
      },
    },
  });

  if (!operator) {
    throw new ForbiddenError("Access Denied: Operator staff record not found.");
  }

  const hasDelegatePermission = operator.staffPermissions.some(
    (sp) => sp.permission.code === "PERMISSION_DELEGATE"
  );

  if (!operator.isSAdmin && !hasDelegatePermission) {
    throw new ForbiddenError("Access Denied: You do not have permission to manage permissions.");
  }
};
export const grantPermissions = async (
  operatorId: string,
  targetStaffId: string,
  permissionCodes: string[]
) => {
  await verifyCanManagePermissions(operatorId);

  const targetStaff = await prisma.staff.findUnique({ where: { id: targetStaffId } });
  if (!targetStaff) throw new NotFoundError("Target staff record not found.");

  // FIX: normalize the same way role/managerType are normalized elsewhere
  // in this codebase — protects against a casing mismatch (e.g.
  // "case_read_all" vs "CASE_READ_ALL") silently matching zero rows.
  const normalizedCodes = permissionCodes.map((c) => c.trim().toUpperCase());

  const matchedPermissions = await prisma.permission.findMany({
    where: { code: { in: normalizedCodes } },
    select: { id: true, code: true },
  });

  if (matchedPermissions.length === 0) {
    throw new BadRequestError("None of the provided permission codes were found in the database.");
  }

  // FIX: report codes that didn't match anything, instead of silently
  // dropping them with no feedback.
  const matchedCodeSet = new Set(matchedPermissions.map((p) => p.code));
  const unknownCodes = normalizedCodes.filter((c) => !matchedCodeSet.has(c));

  // FIX: check what this staff member already has BEFORE inserting, so
  // the response can explicitly say "already granted" instead of just
  // silently no-op'ing via skipDuplicates with no trace of it.
  const existing = await prisma.staffPermission.findMany({
    where: {
      staffId: targetStaffId,
      permissionId: { in: matchedPermissions.map((p) => p.id) },
    },
    select: { permissionId: true },
  });
  const existingIds = new Set(existing.map((e) => e.permissionId));

  const toInsert = matchedPermissions.filter((p) => !existingIds.has(p.id));
  const alreadyGranted = matchedPermissions.filter((p) => existingIds.has(p.id)).map((p) => p.code);

  // FIX: wrapped in a transaction, matching syncPermissions' pattern —
  // also added console logging temporarily so you can PROVE whether the
  // write actually lands. Remove the two console.log lines once confirmed.
  if (toInsert.length > 0) {
    console.log(`[grantPermissions] inserting ${toInsert.length} rows for staff ${targetStaffId}:`, toInsert.map(p => p.code));

    await prisma.$transaction(async (tx) => {
      await tx.staffPermission.createMany({
        data: toInsert.map((p) => ({
          staffId: targetStaffId,
          permissionId: p.id,
          // CONFIRM: does StaffPermission actually have a grantedById
          // column? If not, delete this line — if it does and you leave
          // it out, you lose the audit trail of who granted what.
     
        })),
        skipDuplicates: true,
      });
    });

    const verifyCount = await prisma.staffPermission.count({ where: { staffId: targetStaffId } });
    console.log(`[grantPermissions] staff ${targetStaffId} now has ${verifyCount} total permission rows`);
  }

  const updatedUser = await getStaffWithPermissions(targetStaffId);

  return {
    ...updatedUser,
    newlyGranted: toInsert.map((p) => p.code),
    alreadyGranted,
    unknownCodes,
  };
};

export const revokePermissions = async (
  operatorId: string,
  targetStaffId: string,
  permissionCodes: string[]
) => {
  await verifyCanManagePermissions(operatorId);

  const targetStaff = await prisma.staff.findUnique({ where: { id: targetStaffId } });
  if (!targetStaff) throw new NotFoundError("Target staff record not found.");

  const normalizedCodes = permissionCodes.map((c) => c.trim().toUpperCase());

  // FIX: check what the staff member actually holds BEFORE deleting, so
  // the response can distinguish "revoked" from "they never had this
  // permission in the first place" instead of both looking identical.
  const currentlyHeld = await prisma.staffPermission.findMany({
    where: {
      staffId: targetStaffId,
      permission: { code: { in: normalizedCodes } },
    },
    select: { permission: { select: { code: true } } },
  });
  const heldCodes = currentlyHeld.map((sp) => sp.permission.code);

  const deleteResult = await prisma.staffPermission.deleteMany({
    where: {
      staffId: targetStaffId,
      permission: { code: { in: normalizedCodes } },
    },
  });

  console.log(`[revokePermissions] deleteMany removed ${deleteResult.count} row(s) for staff ${targetStaffId}`);

  const updatedUser = await getStaffWithPermissions(targetStaffId);

  return {
    ...updatedUser,
    revokedCount: deleteResult.count, // FIX: deleteMany's real count — proves whether anything actually happened
    revokedCodes: heldCodes,
    notHeld: normalizedCodes.filter((c) => !heldCodes.includes(c)), // FIX: requested codes the staff never had
  };
};

export const syncPermissions = async (
  operatorId: string,
  targetStaffId: string,
  permissionCodes: string[]
) => {
  await verifyCanManagePermissions(operatorId);

  const targetStaff = await prisma.staff.findUnique({ where: { id: targetStaffId } });
  if (!targetStaff) throw new NotFoundError("Target staff record not found.");

  const normalizedCodes = permissionCodes.map((c) => c.trim().toUpperCase());

  const targetPermissions = await prisma.permission.findMany({
    where: { code: { in: normalizedCodes } },
    select: { id: true, code: true },
  });

  // FIX: same unknown-code reporting as grantPermissions.
  const matchedCodeSet = new Set(targetPermissions.map((p) => p.code));
  const unknownCodes = normalizedCodes.filter((c) => !matchedCodeSet.has(c));

  await prisma.$transaction([
    prisma.staffPermission.deleteMany({ where: { staffId: targetStaffId } }),
    prisma.staffPermission.createMany({
      data: targetPermissions.map((p) => ({
        staffId: targetStaffId,
        permissionId: p.id,
        grantedById: operatorId,
      })),
      skipDuplicates: true,
    }),
  ]);

  const updatedUser = await getStaffWithPermissions(targetStaffId);

  return { ...updatedUser, unknownCodes };
};

export const getStaffWithPermissions = async (staffId: string) => {
  const staff = await prisma.staff.findUnique({
    where: { id: staffId },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      staffPermissions: {
        select: {
          permission: {
            select: { id: true, code: true, name: true, category: true },
          },
        },
      },
    },
  });

  if (!staff) throw new NotFoundError("Staff record not found.");

  return {
    id: staff.id,
    firstName: staff.firstName,
    lastName: staff.lastName,
    email: staff.email,
    permissions: staff.staffPermissions.map((sp) => sp.permission),
  };
};