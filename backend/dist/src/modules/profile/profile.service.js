"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMyProfile = void 0;
const database_1 = require("../../config/database");
const getMyProfile = async (userId) => {
    const user = await database_1.prisma.staff.findUnique({
        where: {
            id: userId
        },
        include: {
            section: true
        }
    });
    return {
        staffNumber: user?.staffNumber,
        fullName: `${user?.firstName} ${user?.middleName}`,
        id: user?.id,
        email: user?.email,
        role: user?.isSAdmin
            ? "SYSTEM_ADMIN"
            : "STAFF",
        status: user?.status,
        phoneNumber: user?.phoneNumber,
        gender: user?.gender,
        department: "N/A",
        division: "N/A",
        section: user?.section?.id,
        createdAt: user?.createdAt,
        lastLogin: "Today",
        caseCount: 0,
        pendingApprovals: 0,
        permissions: [
            "Manage Organizations",
            "Approve Users",
            "Manage Cases",
            "Reports & Analytics",
            "Customer Feedback",
            "Export Reports"
        ]
    };
};
exports.getMyProfile = getMyProfile;
