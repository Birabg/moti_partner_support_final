import { Prisma } from "../../../generated/prisma/client";
import { getDefaultPermissionCodes } from "../../config/default.permission";
import { BadRequestError } from "../../utils/error";

export const syncStaffDefaultPermissions = async (
  tx: Prisma.TransactionClient,
  staffId: string,
  role: string,
  managerType?: string,
  customPermissionCodes?: string[] 
) => {

  const codesToAssign =
    customPermissionCodes && customPermissionCodes.length > 0
      ? customPermissionCodes
      : getDefaultPermissionCodes(role, managerType);


  const matchedPermissions = await tx.permission.findMany({
    where: { code: { in: codesToAssign } },
    select: { id: true, code: true },
  });

  const foundCodes = matchedPermissions.map((p) => p.code);
  const missingCodes = codesToAssign.filter((c) => !foundCodes.includes(c));
  if (missingCodes.length > 0) {
    throw new BadRequestError(
      `Permission code(s) not found in database: ${missingCodes.join(", ")}`
    );
  }

  await tx.staffPermission.deleteMany({
    where: { staffId },
  });

  if (matchedPermissions.length > 0) {
    await tx.staffPermission.createMany({
      data: matchedPermissions.map((p) => ({
        staffId,
        permissionId: p.id,
      })),
    });
  }
};