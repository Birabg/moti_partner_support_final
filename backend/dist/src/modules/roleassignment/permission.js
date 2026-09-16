"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.syncStaffDefaultPermissions = void 0;
const default_permission_1 = require("../../config/default.permission");
const error_1 = require("../../utils/error");
const syncStaffDefaultPermissions = async (tx, staffId, role, managerType, customPermissionCodes) => {
    const defaultCodes = (0, default_permission_1.getDefaultPermissionCodes)(role, managerType);
    const codesToAssign = Array.from(new Set([
        ...defaultCodes,
        ...(customPermissionCodes || []),
    ].map((code) => code?.trim().toUpperCase())));
    const matchedPermissions = await tx.permission.findMany({
        where: { code: { in: codesToAssign } },
        select: { id: true, code: true },
    });
    const foundCodes = matchedPermissions.map((p) => p.code);
    const missingCodes = codesToAssign.filter((c) => !foundCodes.includes(c));
    if (missingCodes.length > 0) {
        throw new error_1.BadRequestError(`Permission code(s) not found in database: ${missingCodes.join(", ")}`);
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
exports.syncStaffDefaultPermissions = syncStaffDefaultPermissions;
