import { prisma } from "../../config/database";
import { getDefaultPermissionCodes } from "../../config/default.permission";
import { BadRequestError, NotFoundError, ForbiddenError } from "../../utils/error";

const normalizePermissionCodes = (codes: string[] = []) =>
  Array.from(
    new Set(
      (codes || [])
        .map((code) => code?.trim().toUpperCase())
        .filter(Boolean)
    )
  );

const getStaffRolePermissionContext = async (staffId: string) => {
  const staff = await prisma.staff.findUnique({
    where: { id: staffId },
    select: {
      isSAdmin: true,
      isManager: true,
      isDirector: true,
      isPSsupport: true,
      managedDepartment: { select: { id: true } },
      managedDivision: { select: { id: true } },
      managedSection: { select: { id: true } },
    },
  });

  if (!staff) throw new NotFoundError("Staff record not found.");

  let role: string | null = null;
  let managerType: string | null = null;

  if (staff.isSAdmin) {
    role = "SYSTEM_ADMIN";
  } else if (staff.isDirector) {
    role = "DIRECTOR";
  } else if (staff.isManager) {
    role = "MANAGER";
    if (staff.managedDepartment) managerType = "DEPARTMENT";
    else if (staff.managedDivision) managerType = "DIVISION";
    else if (staff.managedSection) managerType = "SECTION";
  } else if (staff.isPSsupport) {
    role = "PS_SUPPORT";
  }

  const defaultCodes = getDefaultPermissionCodes(role || undefined, managerType || undefined);
  const defaultIds = defaultCodes.length
    ? (
        await prisma.permission.findMany({
          where: { code: { in: defaultCodes.map((code) => code.toUpperCase()) } },
          select: { id: true, code: true },
        })
      ).map((permission) => permission.id)
    : [];

  return {
    role,
    managerType,
    defaultCodes: Array.from(new Set(defaultCodes.map((code) => code.toUpperCase()))),
    defaultIds,
  };
};

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

  const normalizedCodes = normalizePermissionCodes(permissionCodes);
  const defaultContext = await getStaffRolePermissionContext(targetStaffId);
  const extraCodes = normalizedCodes.filter((code) => !defaultContext.defaultCodes.includes(code));

  if (extraCodes.length === 0) {
    const updatedUser = await getStaffWithPermissions(targetStaffId);
    return {
      ...updatedUser,
      newlyGranted: [],
      alreadyGranted: [],
      unknownCodes: [],
      ignoredDefaultCodes: normalizedCodes.filter((code) => defaultContext.defaultCodes.includes(code)),
    };
  }

  const matchedPermissions = await prisma.permission.findMany({
    where: { code: { in: extraCodes } },
    select: { id: true, code: true },
  });

  if (matchedPermissions.length === 0) {
    throw new BadRequestError("None of the provided permission codes were found in the database.");
  }

  const matchedCodeSet = new Set(matchedPermissions.map((p) => p.code));
  const unknownCodes = extraCodes.filter((code) => !matchedCodeSet.has(code));

  const existing = await prisma.staffPermission.findMany({
    where: {
      staffId: targetStaffId,
      permissionId: { in: matchedPermissions.map((p) => p.id) },
    },
    select: { permissionId: true },
  });
  const existingIds = new Set(existing.map((entry) => entry.permissionId));

  const toInsert = matchedPermissions.filter((permission) => !existingIds.has(permission.id));
  const alreadyGranted = matchedPermissions
    .filter((permission) => existingIds.has(permission.id))
    .map((permission) => permission.code);

  if (toInsert.length > 0) {
    await prisma.staffPermission.createMany({
      data: toInsert.map((permission) => ({
        staffId: targetStaffId,
        permissionId: permission.id,
      })),
      skipDuplicates: true,
    });
  }

  const updatedUser = await getStaffWithPermissions(targetStaffId);

  return {
    ...updatedUser,
    newlyGranted: toInsert.map((permission) => permission.code),
    alreadyGranted,
    unknownCodes,
    ignoredDefaultCodes: normalizedCodes.filter((code) => defaultContext.defaultCodes.includes(code)),
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

  const normalizedCodes = normalizePermissionCodes(permissionCodes);
  const defaultContext = await getStaffRolePermissionContext(targetStaffId);
  const removableCodes = normalizedCodes.filter((code) => !defaultContext.defaultCodes.includes(code));

  if (removableCodes.length === 0) {
    const updatedUser = await getStaffWithPermissions(targetStaffId);
    return {
      ...updatedUser,
      revokedCount: 0,
      revokedCodes: [],
      notHeld: normalizedCodes,
      ignoredDefaultCodes: normalizedCodes.filter((code) => defaultContext.defaultCodes.includes(code)),
    };
  }

  const currentlyHeld = await prisma.staffPermission.findMany({
    where: {
      staffId: targetStaffId,
      permission: { code: { in: removableCodes } },
    },
    select: { permission: { select: { code: true } } },
  });
  const heldCodes = currentlyHeld.map((entry) => entry.permission.code);

  const deleteResult = await prisma.staffPermission.deleteMany({
    where: {
      staffId: targetStaffId,
      permission: { code: { in: removableCodes } },
    },
  });

  const updatedUser = await getStaffWithPermissions(targetStaffId);

  return {
    ...updatedUser,
    revokedCount: deleteResult.count,
    revokedCodes: heldCodes,
    notHeld: removableCodes.filter((code) => !heldCodes.includes(code)),
    ignoredDefaultCodes: normalizedCodes.filter((code) => defaultContext.defaultCodes.includes(code)),
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

  const normalizedCodes = normalizePermissionCodes(permissionCodes);
  const defaultContext = await getStaffRolePermissionContext(targetStaffId);
  const extraCodes = normalizedCodes.filter((code) => !defaultContext.defaultCodes.includes(code));

  const matchedPermissions = extraCodes.length
    ? await prisma.permission.findMany({
        where: { code: { in: extraCodes } },
        select: { id: true, code: true },
      })
    : [];

  const matchedCodeSet = new Set(matchedPermissions.map((permission) => permission.code));
  const unknownCodes = extraCodes.filter((code) => !matchedCodeSet.has(code));

  await prisma.$transaction(async (tx) => {
    if (defaultContext.defaultIds.length > 0) {
      await tx.staffPermission.deleteMany({
        where: {
          staffId: targetStaffId,
          permissionId: { notIn: defaultContext.defaultIds },
        },
      });
    } else {
      await tx.staffPermission.deleteMany({ where: { staffId: targetStaffId } });
    }

    if (matchedPermissions.length > 0) {
      await tx.staffPermission.createMany({
        data: matchedPermissions.map((permission) => ({
          staffId: targetStaffId,
          permissionId: permission.id,
        })),
        skipDuplicates: true,
      });
    }
  });

  const updatedUser = await getStaffWithPermissions(targetStaffId);

  return {
    ...updatedUser,
    unknownCodes,
    defaultPermissions: defaultContext.defaultCodes,
    customPermissions: matchedPermissions.map((permission) => permission.code),
  };
};

export const getStaffWithPermissions = async (staffId: string) => {
  const staff = await prisma.staff.findUnique({
    where: { id: staffId },
    select: {
      id: true,
      staffNumber: true,
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
    staffNumber: staff.staffNumber,
    firstName: staff.firstName,
    lastName: staff.lastName,
    email: staff.email,
    permissions: staff.staffPermissions.map((sp) => sp.permission),
  };
};