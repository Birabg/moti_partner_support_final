"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllCustomerUsers = exports.getAllStaffUsers = exports.getActiveUsersHandler = exports.getActiveUsers = exports.getStaffDeepDetailProfile = exports.getStaffMetricsCount = exports.getCustomerHistoryProfile = exports.getActiveCustomersCount = void 0;
const database_1 = require("../../../../config/database");
const error_1 = require("../../../../utils/error");
const getActiveCustomersCount = async (req, res, next) => {
    try {
        const activeCount = await database_1.prisma.customer.count({
            where: {
                status: "ACTIVE"
            }
        });
        return res.status(200).json({
            success: true,
            data: {
                activeCustomersCount: activeCount
            }
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getActiveCustomersCount = getActiveCustomersCount;
const getCustomerHistoryProfile = async (req, res, next) => {
    try {
        const customerId = req.params.customerId;
        let customer;
        try {
            customer = await database_1.prisma.customer.findUnique({
                where: { id: customerId },
                include: {
                    cases: {
                        orderBy: { createdAt: "desc" },
                        include: {
                            statusHistory: { orderBy: { id: "desc" } },
                            assignedSupport: {
                                select: { id: true, firstName: true, lastName: true },
                            },
                            productCategory: { select: { id: true, name: true } },
                            productSubcategory: { select: { id: true, name: true } },
                            feedback: { select: { rating: true, comment: true, submittedAt: true } },
                        },
                    },
                },
            });
        }
        catch (err) {
            if (err?.code === 'P2022') {
                // fallback: load without statusHistory to avoid crashing when DB schema is out-of-sync
                customer = await database_1.prisma.customer.findUnique({
                    where: { id: customerId },
                    include: {
                        cases: {
                            orderBy: { createdAt: "desc" },
                            include: {
                                assignedSupport: { select: { id: true, firstName: true, lastName: true } },
                                productCategory: { select: { id: true, name: true } },
                                productSubcategory: { select: { id: true, name: true } },
                                feedback: { select: { rating: true, comment: true, submittedAt: true } },
                            },
                        },
                    },
                });
                if (customer && Array.isArray(customer.cases)) {
                    customer.cases = customer.cases.map((c) => ({ ...c, statusHistory: c.statusHistory || [] }));
                }
            }
            else {
                throw err;
            }
        }
        if (!customer) {
            throw new error_1.NotFoundError("Target customer profile could not be located.");
        }
        return res.status(200).json({
            success: true,
            data: {
                customer: {
                    id: customer.id,
                    firstName: customer.firstName,
                    middleName: customer.middleName,
                    lastName: customer.lastName,
                    email: customer.email,
                },
                history: customer.cases,
            },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getCustomerHistoryProfile = getCustomerHistoryProfile;
const getStaffMetricsCount = async (req, res, next) => {
    try {
        const staffCount = await database_1.prisma.staff.count({
            where: {
                status: "ACTIVE"
            }
        });
        return res.status(200).json({
            success: true,
            data: {
                activeStaffCount: staffCount
            }
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getStaffMetricsCount = getStaffMetricsCount;
const getStaffDeepDetailProfile = async (req, res, next) => {
    try {
        const staffId = req.params.staffId;
        const staffRecord = await database_1.prisma.staff.findUnique({
            where: { id: staffId },
            include: {
                section: {
                    include: {
                        division: {
                            include: { department: true },
                        },
                    },
                },
                managedDepartment: true,
                managedDivision: {
                    include: { department: true },
                },
                managedSection: {
                    include: {
                        division: { include: { department: true } },
                    },
                },
                assignedCases: {
                    orderBy: { id: "desc" },
                    select: {
                        id: true,
                        caseNumber: true,
                        subject: true,
                        status: true,
                        priority: true,
                        createdAt: true,
                    },
                },
            },
        });
        if (!staffRecord) {
            throw new error_1.NotFoundError("Target staff member profile could not be located in the system.");
        }
        const agent = staffRecord;
        const activeCases = (agent.assignedCases || []).filter((c) => c.status !== "RESOLVED" && c.status !== "CLOSED");
        const completedCases = (agent.assignedCases || []).filter((c) => c.status === "RESOLVED" || c.status === "CLOSED");
        const totalAssignedHistorically = agent.assignedCases?.length || 0;
        const openCount = activeCases.filter((c) => c.status === "OPEN").length;
        const inProgressCount = activeCases.filter((c) => c.status === "IN_PROGRESS").length;
        const closedCount = completedCases.length;
        const ratedCases = completedCases.filter((c) => typeof c.rating === "number");
        const totalRatingSum = ratedCases.reduce((sum, c) => sum + c.rating, 0);
        const averageFeedbackRating = ratedCases.length > 0 ? parseFloat((totalRatingSum / ratedCases.length).toFixed(2)) : null;
        let structuralAssignment;
        if (agent.section) {
            structuralAssignment = {
                assignmentType: "SECTION_MEMBER",
                sectionId: agent.sectionId,
                sectionName: agent.section.name,
                divisionId: agent.section.division?.id || null,
                divisionName: agent.section.division?.name || "Unassigned",
                departmentId: agent.section.division?.department?.id || null,
                departmentName: agent.section.division?.department?.name || "Unassigned",
            };
        }
        else if (agent.managedSection) {
            structuralAssignment = {
                assignmentType: "SECTION_MANAGER",
                sectionId: agent.managedSection.id,
                sectionName: agent.managedSection.name,
                divisionId: agent.managedSection.division?.id || null,
                divisionName: agent.managedSection.division?.name || "Unassigned",
                departmentId: agent.managedSection.division?.department?.id || null,
                departmentName: agent.managedSection.division?.department?.name || "Unassigned",
            };
        }
        else if (agent.managedDivision) {
            structuralAssignment = {
                assignmentType: "DIVISION_MANAGER",
                sectionId: null,
                sectionName: null,
                divisionId: agent.managedDivision.id,
                divisionName: agent.managedDivision.name,
                departmentId: agent.managedDivision.department?.id || null,
                departmentName: agent.managedDivision.department?.name || "Unassigned",
            };
        }
        else if (agent.managedDepartment) {
            structuralAssignment = {
                assignmentType: "DEPARTMENT_MANAGER",
                sectionId: null,
                sectionName: null,
                divisionId: null,
                divisionName: null,
                departmentId: agent.managedDepartment.id,
                departmentName: agent.managedDepartment.name,
            };
        }
        else {
            structuralAssignment = {
                assignmentType: "UNASSIGNED",
                sectionId: null,
                sectionName: "Unassigned",
                divisionId: null,
                divisionName: "Unassigned",
                departmentId: null,
                departmentName: "Unassigned",
            };
        }
        return res.status(200).json({
            success: true,
            data: {
                profile: {
                    id: agent.id,
                    name: `${agent.firstName} ${agent.middleName || ""} ${agent.lastName || ""}`.trim(),
                    email: agent.email,
                    status: agent.status,
                    isSystemAdmin: agent.isSAdmin,
                    isPSsupport: agent.isPSsupport ?? false,
                    role: agent.isSAdmin
                        ? "SYSTEM_ADMIN"
                        : agent.isManager
                            ? "MANAGER"
                            : agent.isPSsupport
                                ? "PSSUPPORT"
                                : "STAFF",
                },
                structuralAssignment,
                workloadMetrics: {
                    totalAssignedHistorically,
                    activeOpenCount: openCount,
                    activeInProgressCount: inProgressCount,
                    historicalClosedCount: closedCount,
                    averageFeedbackRatingReceived: averageFeedbackRating,
                },
                activeWorkloadList: activeCases,
                historicalClosedList: completedCases.map((c) => ({
                    id: c.id,
                    caseNumber: c.caseNumber,
                    subject: c.subject,
                    resolvedAt: c.resolvedAt,
                    feedback: {
                        rating: c.rating || null,
                        comment: c.customerFeedback || c.feedback || null,
                    },
                })),
            },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getStaffDeepDetailProfile = getStaffDeepDetailProfile;
const getActiveUsers = async () => {
    const [activeStaff, activeCustomers] = await Promise.all([
        database_1.prisma.staff.findMany({
            where: { status: "ACTIVE" },
            include: {
                section: { select: { id: true, name: true } },
            },
            orderBy: { createdAt: "desc" },
        }),
        database_1.prisma.customer.findMany({
            where: { status: "ACTIVE" },
            orderBy: { createdAt: "desc" },
        }),
    ]);
    const formattedStaff = activeStaff.map((staff) => {
        const sec = staff.section;
        const dept = staff.department;
        const div = staff.division;
        return {
            id: staff.id,
            userType: "STAFF",
            firstName: staff.firstName,
            middleName: staff.middleName,
            lastName: staff.lastName,
            email: staff.email,
            phoneNumber: staff.phoneNumber,
            status: staff.status,
            createdAt: staff.createdAt,
            roleInfo: {
                isManager: staff.isManager ?? false,
                isPSsupport: staff.isPSsupport ?? false,
                isSAdmin: staff.isSAdmin ?? false,
                isDirector: staff.isDirector ?? false,
                department: dept?.name ?? null,
                division: div?.name ?? null,
                section: sec?.name ?? null,
            },
        };
    });
    const formattedCustomers = activeCustomers.map((customer) => ({
        id: customer.id,
        userType: "CUSTOMER",
        firstName: customer.firstName,
        middleName: customer.middleName,
        lastName: customer.lastName,
        email: customer.email,
        phoneNumber: customer.phoneNumber,
        status: customer.status,
        createdAt: customer.createdAt,
    }));
    return [...formattedStaff, ...formattedCustomers].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};
exports.getActiveUsers = getActiveUsers;
const getActiveUsersHandler = async (req, res, next) => {
    try {
        const activeUsers = await (0, exports.getActiveUsers)();
        return res.status(200).json({
            success: true,
            count: activeUsers.length,
            data: activeUsers,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getActiveUsersHandler = getActiveUsersHandler;
const getAllStaffUsers = async (req, res, next) => {
    try {
        const staff = await database_1.prisma.staff.findMany({
            include: {
                section: { select: { id: true, name: true } },
            },
            orderBy: { createdAt: "desc" },
        });
        return res.status(200).json({
            success: true,
            count: staff.length,
            data: staff,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getAllStaffUsers = getAllStaffUsers;
const getAllCustomerUsers = async (req, res, next) => {
    try {
        const customers = await database_1.prisma.customer.findMany({
            orderBy: { createdAt: "desc" },
        });
        return res.status(200).json({
            success: true,
            count: customers.length,
            data: customers,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getAllCustomerUsers = getAllCustomerUsers;
