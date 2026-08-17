"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDivisionAnalytics = void 0;
const database_1 = require("../../../config/database");
const error_1 = require("../../../utils/error");
const divisionAnalyticsInclude = {
    manager: {
        select: {
            id: true,
            firstName: true,
            middleName: true,
            lastName: true,
            email: true,
        },
    },
    department: {
        select: { id: true, name: true },
    },
    sections: {
        include: {
            manager: {
                select: {
                    id: true,
                    firstName: true,
                    middleName: true,
                    lastName: true,
                    email: true,
                },
            },
            staff: {
                select: {
                    id: true,
                    firstName: true,
                    middleName: true,
                    lastName: true,
                    email: true,
                    isPSsupport: true,
                    isManager: true,
                },
            },
        },
    },
};
const getDivisionAnalytics = async (req, res, next) => {
    try {
        const actor = req.user || req.staff;
        if (!actor) {
            throw new error_1.UnauthorizedError("Authentication required.");
        }
        const isSystemAdmin = Boolean(actor.isSAdmin);
        const rawStaffId = actor.id || actor.userId || actor.staffId || actor._id;
        const staffId = typeof rawStaffId === "string" ? rawStaffId : undefined;
        if (!staffId) {
            throw new error_1.UnauthorizedError("User identifier missing from request context.");
        }
        let managedDivId = null;
        if (!isSystemAdmin) {
            const staffProfile = await database_1.prisma.staff.findUnique({
                where: { id: staffId },
                select: {
                    managedDivision: {
                        select: { id: true },
                    },
                },
            });
            managedDivId = staffProfile?.managedDivision?.id || null;
        }
        let requestedDivId = undefined;
        if (typeof req.params.id === "string") {
            requestedDivId = req.params.id;
        }
        else if (typeof req.query.divisionId === "string") {
            requestedDivId = req.query.divisionId;
        }
        let targetDivId = requestedDivId || managedDivId;
        if (!isSystemAdmin) {
            if (!managedDivId) {
                throw new error_1.ForbiddenError("Access Denied: You are not assigned as a Division Manager.");
            }
            if (requestedDivId && requestedDivId !== managedDivId) {
                throw new error_1.ForbiddenError("Access Denied: You can only view analytics for your assigned division.");
            }
            targetDivId = managedDivId;
        }
        if (!targetDivId) {
            throw new error_1.NotFoundError("Division ID is required.");
        }
        const finalDivId = targetDivId;
        const divisionData = await database_1.prisma.division.findUnique({
            where: { id: finalDivId },
            include: divisionAnalyticsInclude,
        });
        if (!divisionData) {
            throw new error_1.NotFoundError("Division record not found.");
        }
        const division = divisionData;
        const cases = await database_1.prisma.caseReport.findMany({
            where: {
                assignedSupport: {
                    section: {
                        divisionId: finalDivId,
                    },
                },
            },
            select: {
                id: true,
                caseNumber: true,
                subject: true,
                status: true,
                priority: true,
                createdAt: true,
                assignedSupportId: true,
                assignedSupport: {
                    select: {
                        id: true,
                        firstName: true,
                        middleName: true,
                        lastName: true,
                        email: true,
                    },
                },
            },
        });
        const totalCasesCount = cases.length;
        const casesByStatus = cases.reduce((acc, curr) => {
            acc[curr.status] = (acc[curr.status] || 0) + 1;
            return acc;
        }, {});
        let totalDivisionStaffCount = 0;
        const sectionDetails = division.sections.map((sec) => {
            const sectionStaff = sec.staff || [];
            const staffCount = sectionStaff.length;
            totalDivisionStaffCount += staffCount;
            const secManagerName = sec.manager
                ? `${sec.manager.firstName} ${sec.manager.lastName || sec.manager.middleName || ""}`.trim()
                : null;
            return {
                id: sec.id,
                name: sec.name,
                manager: secManagerName,
                staffCount,
                staffMembers: sectionStaff.map((m) => ({
                    id: m.id,
                    name: `${m.firstName} ${m.lastName || m.middleName || ""}`.trim(),
                    email: m.email,
                    isPSsupport: m.isPSsupport,
                    isManager: m.isManager,
                })),
            };
        });
        const divManagerName = division.manager
            ? `${division.manager.firstName} ${division.manager.lastName || division.manager.middleName || ""}`.trim()
            : null;
        return res.status(200).json({
            success: true,
            data: {
                division: {
                    id: division.id,
                    name: division.name,
                    parentDepartment: division.department
                        ? {
                            id: division.department.id,
                            name: division.department.name,
                        }
                        : null,
                    manager: division.manager
                        ? {
                            id: division.manager.id,
                            name: divManagerName,
                            email: division.manager.email,
                        }
                        : null,
                },
                hierarchyMetrics: {
                    totalSectionsCount: division.sections.length,
                    totalDivisionStaffCount,
                    sections: sectionDetails,
                },
                caseMetrics: {
                    totalAssignedCases: totalCasesCount,
                    casesByStatus,
                    cases,
                },
            },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getDivisionAnalytics = getDivisionAnalytics;
