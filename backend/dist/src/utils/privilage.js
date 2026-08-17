"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPrivilegedStaffEmails = void 0;
const database_1 = require("../config/database");
const getPrivilegedStaffEmails = async () => {
    const staffWithPermission = await database_1.prisma.staff.findMany({
        where: {
            status: "ACTIVE",
            OR: [
                { isSAdmin: true },
                {
                    staffPermissions: {
                        some: {
                            permission: {
                                code: "RECEIVE_NEW_CASE",
                            },
                        },
                    },
                },
            ],
        },
        select: { email: true },
    });
    return staffWithPermission.map((s) => s.email);
};
exports.getPrivilegedStaffEmails = getPrivilegedStaffEmails;
