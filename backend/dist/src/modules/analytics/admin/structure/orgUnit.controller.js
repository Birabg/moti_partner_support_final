"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getServiceTypesList = exports.getSectionAnalytics = exports.getDivisionAnalytics = exports.getDepartmentAnalyticsId = exports.getDepartmentAnalytics = void 0;
const database_1 = require("../../../../config/database");
const error_1 = require("../../../../utils/error");
const getDepartmentAnalytics = async (req, res, next) => {
    try {
        const departments = await database_1.prisma.department.findMany({
            include: {
                manager: {
                    select: { id: true, firstName: true, middleName: true, email: true }
                }
            },
            orderBy: { name: "asc" }
        });
        const departmentDetails = departments.map((dept) => ({
            id: dept.id,
            name: dept.name,
            isActive: dept.isActive ?? true,
            manager: dept.manager ? {
                id: dept.manager.id,
                name: `${dept.manager.firstName} ${dept.manager.middleName}`,
                email: dept.manager.email
            } : null
        }));
        return res.status(200).json({
            success: true,
            data: {
                totalDepartmentsCount: departments.length,
                departments: departmentDetails
            }
        });
    }
    catch (error) {
        if (error instanceof TypeError || error.code === "P2025") {
            return res.status(200).json({ success: true, data: { totalDepartmentsCount: 0, departments: [], message: "Department model not yet initialized in schema." } });
        }
        next(error);
    }
};
exports.getDepartmentAnalytics = getDepartmentAnalytics;
const getDepartmentAnalyticsId = async (req, res, next) => {
    try {
        const actor = req.user;
        const requestedDeptId = req.params.departmentId || req.query.departmentId;
        const isSystemAdmin = Boolean(actor.isSAdmin);
        const managedDeptId = actor.managedDepartmentId || actor.staffProfile?.managedDepartmentId;
        let targetDeptId = requestedDeptId || managedDeptId;
        if (!isSystemAdmin) {
            if (!managedDeptId) {
                throw new error_1.ForbiddenError("Access Denied: You are not assigned as a Department Manager.");
            }
            if (requestedDeptId && requestedDeptId !== managedDeptId) {
                throw new error_1.ForbiddenError("Access Denied: You can only view analytics for your assigned department.");
            }
            targetDeptId = managedDeptId;
        }
        if (!targetDeptId) {
            throw new error_1.NotFoundError("Department ID is required.");
        }
        const department = await database_1.prisma.department.findUnique({
            where: { id: targetDeptId },
            include: {
                manager: {
                    select: { id: true, firstName: true, lastName: true, email: true },
                },
                divisions: {
                    include: {
                        manager: {
                            select: { id: true, firstName: true, lastName: true, email: true },
                        },
                        sections: {
                            include: {
                                manager: {
                                    select: { id: true, firstName: true, lastName: true, email: true },
                                },
                                staff: {
                                    select: {
                                        id: true,
                                        firstName: true,
                                        lastName: true,
                                        email: true,
                                        isSAdmin: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });
        if (!department) {
            throw new error_1.NotFoundError("Department record not found.");
        }
        const cases = await database_1.prisma.caseReport.findMany({
            where: {
                assignedSupport: {
                    section: {
                        division: {
                            departmentId: targetDeptId,
                        },
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
        let totalStaffCount = 0;
        const divisionDetails = department.divisions.map((div) => {
            const sectionDetails = div.sections.map((sec) => {
                totalStaffCount += sec.staff.length;
                return {
                    id: sec.id,
                    name: sec.name,
                    manager: sec.manager
                        ? `${sec.manager.firstName} ${sec.manager.lastName}`
                        : null,
                    staffCount: sec.staff.length,
                    staffMembers: sec.staff,
                };
            });
            return {
                id: div.id,
                name: div.name,
                manager: div.manager
                    ? `${div.manager.firstName} ${div.manager.lastName}`
                    : null,
                sectionsCount: div.sections.length,
                sections: sectionDetails,
            };
        });
        return res.status(200).json({
            success: true,
            data: {
                department: {
                    id: department.id,
                    name: department.name,
                    manager: department.manager
                        ? {
                            id: department.manager.id,
                            name: `${department.manager.firstName} ${department.manager.lastName}`.trim(),
                            email: department.manager.email,
                        }
                        : null,
                },
                hierarchyMetrics: {
                    totalDivisionsCount: department.divisions.length,
                    totalSectionsCount: divisionDetails.reduce((acc, div) => acc + div.sectionsCount, 0),
                    totalDepartmentStaffCount: totalStaffCount,
                    divisions: divisionDetails,
                },
                caseMetrics: {
                    totalAssignedCases: totalCasesCount,
                    casesByStatus,
                    recentCases: cases.slice(0, 10),
                },
            },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getDepartmentAnalyticsId = getDepartmentAnalyticsId;
const getDivisionAnalytics = async (req, res, next) => {
    try {
        const divisions = await database_1.prisma.division.findMany({
            include: {
                manager: {
                    select: { id: true, firstName: true, middleName: true, email: true }
                },
                sections: {
                    select: { id: true, name: true }
                },
                department: {
                    select: { id: true, name: true, managerId: true }
                }
            },
            orderBy: { name: "asc" }
        });
        const divisionDetails = divisions.map(div => {
            const division = div;
            return {
                id: division.id,
                name: division.name,
                isActive: division.isActive ?? true,
                manager: division.manager ? {
                    id: division.manager.id,
                    name: `${division.manager.firstName} ${division.manager.middleName}`,
                    email: division.manager.email
                } : null,
                parentDepartment: division.department ? {
                    id: division.department.id,
                    name: division.department.name
                } : { id: null, name: "Direct Tier / Independent" },
                metrics: {
                    totalSectionsCount: division.sections?.length || 0
                },
                sections: division.sections || []
            };
        });
        return res.status(200).json({
            success: true,
            data: {
                totalDivisionsCount: divisions.length,
                divisions: divisionDetails
            }
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getDivisionAnalytics = getDivisionAnalytics;
const getSectionAnalytics = async (req, res, next) => {
    try {
        const sections = await database_1.prisma.section.findMany({
            include: {
                manager: {
                    select: { id: true, firstName: true, middleName: true, email: true }
                },
                staff: {
                    select: { id: true }
                },
                division: {
                    include: {
                        department: true
                    }
                }
            },
            orderBy: { name: "asc" }
        });
        const sectionDetails = sections.map(sec => {
            const section = sec;
            return {
                id: section.id,
                name: section.name,
                isActive: section.isActive,
                manager: section.manager ? {
                    id: section.manager.id,
                    name: `${section.manager.firstName} ${section.manager.middleName}`,
                    email: section.manager.email
                } : null,
                ancestryChain: {
                    immediateDivision: section.division ? {
                        id: section.division.id,
                        name: section.division.name
                    } : null,
                    grandparentDepartment: section.division?.department ? {
                        id: section.division.department.id,
                        name: section.division.department.name
                    } : { id: null, name: "Unassigned / Direct to Division" }
                },
                metrics: {
                    activeStaffCount: section.staff?.length || 0
                }
            };
        });
        return res.status(200).json({
            success: true,
            data: {
                totalSectionsCount: sections.length,
                sections: sectionDetails
            }
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getSectionAnalytics = getSectionAnalytics;
const getServiceTypesList = async (req, res, next) => {
    try {
        const serviceTypeClient = database_1.prisma.serviceType || database_1.prisma.caseServiceType;
        if (!serviceTypeClient) {
            return res.status(200).json({
                success: true,
                data: { totalServiceTypesCount: 0, serviceTypes: [], note: "ServiceType model configuration missing from Prisma setup." }
            });
        }
        const serviceTypes = await serviceTypeClient.findMany({
            include: {
                cases: {
                    select: {
                        id: true
                    }
                }
            },
            orderBy: {
                name: "asc"
            }
        });
        const typeDetails = serviceTypes.map((type) => ({
            id: type.id,
            name: type.name,
            code: type.code || null,
            description: type.description || null,
            isActive: type.isActive ?? true,
            metrics: {
                historicalCasesCount: type.caseReports?.length || 0
            }
        }));
        return res.status(200).json({
            success: true,
            data: {
                totalServiceTypesCount: serviceTypes.length,
                serviceTypes: typeDetails
            }
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getServiceTypesList = getServiceTypesList;
