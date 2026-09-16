"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllCasesDeepDetail = exports.getGlobalCaseMetrics = exports.getCaseDeepDetailProfile = exports.getCaseSummaryMetrics = exports.buildHierarchyWhereClause = void 0;
const database_1 = require("../../../../config/database");
const client_1 = require("../../../../../generated/prisma/client");
const error_1 = require("../../../../utils/error");
const buildHierarchyWhereClause = (actor) => {
    if (actor.isSAdmin || actor.isDirector) {
        return {};
    }
    if (actor.managedDepartmentId || actor.departmentId) {
        const deptId = actor.managedDepartmentId || actor.departmentId;
        return {
            OR: [
                { productCategoryId: deptId }, // If cases map via product category/department
                { assignedSupport: { section: { division: { departmentId: deptId } } } },
            ],
        };
    }
    if (actor.managedDivisionId || actor.divisionId) {
        const divId = actor.managedDivisionId || actor.divisionId;
        return {
            assignedSupport: {
                section: { divisionId: divId },
            },
        };
    }
    if (actor.managedSectionId || actor.sectionId) {
        const secId = actor.managedSectionId || actor.sectionId;
        return {
            assignedSupport: { sectionId: secId },
        };
    }
    return {
        OR: [
            { assignedSupportId: actor.userId || actor.id },
            { assignedSupportId: null },
        ],
    };
};
exports.buildHierarchyWhereClause = buildHierarchyWhereClause;
const getCaseSummaryMetrics = async (req, res, next) => {
    try {
        const actor = req.user;
        if (!actor) {
            throw new error_1.ForbiddenError("Access Denied: Authentication required.");
        }
        const scopeWhere = (0, exports.buildHierarchyWhereClause)(actor);
        // Derive per-status counts directly from the database in a single query so every
        // status in the CaseStatus enum (including CANCELLED) is always represented
        // instead of relying on a hand-maintained list of counters.
        const grouped = await database_1.prisma.caseReport.groupBy({
            by: ["status"],
            where: scopeWhere,
            _count: { _all: true },
        });
        const statusCounts = {};
        for (const row of grouped) {
            statusCounts[row.status] = row._count._all;
        }
        const getCount = (status) => statusCounts[status] ?? 0;
        const totalCases = grouped.reduce((sum, row) => sum + row._count._all, 0);
        return res.status(200).json({
            success: true,
            data: {
                total: totalCases,
                open: getCount(client_1.CaseStatus.OPEN),
                // Existing application logic counts ASSIGNED cases as part of "in progress".
                inProgress: getCount(client_1.CaseStatus.IN_PROGRESS) + getCount(client_1.CaseStatus.ASSIGNED),
                pending: getCount(client_1.CaseStatus.PENDING),
                escalated: getCount(client_1.CaseStatus.ESCALATED),
                resolved: getCount(client_1.CaseStatus.RESOLVED),
                customerConfirmation: getCount(client_1.CaseStatus.CUSTOMER_CONFIRMATION),
                closed: getCount(client_1.CaseStatus.CLOSED),
                cancelled: getCount(client_1.CaseStatus.CANCELLED),
            },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getCaseSummaryMetrics = getCaseSummaryMetrics;
const getCaseDeepDetailProfile = async (req, res, next) => {
    try {
        const actor = req.user;
        if (!actor) {
            throw new error_1.ForbiddenError("Access Denied: Authentication required.");
        }
        const caseId = req.params.caseId;
        const scopeWhere = (0, exports.buildHierarchyWhereClause)(actor);
        // attempt to load the full target case including statusHistory; if DB schema is missing status history columns fall back to a safer query without the include
        let targetCase;
        try {
            targetCase = await database_1.prisma.caseReport.findFirst({
                where: {
                    id: caseId,
                    ...scopeWhere,
                },
                include: {
                    customer: {
                        select: {
                            id: true,
                            firstName: true,
                            middleName: true,
                            email: true,
                        },
                    },
                    assignedSupport: {
                        select: {
                            id: true,
                            firstName: true,
                            middleName: true,
                            email: true,
                            section: {
                                select: {
                                    id: true,
                                    name: true,
                                    division: {
                                        select: { id: true, name: true },
                                    },
                                },
                            },
                        },
                    },
                    updatedBy: {
                        select: {
                            id: true,
                            firstName: true,
                            middleName: true,
                        },
                    },
                    closedBy: {
                        select: {
                            id: true,
                            firstName: true,
                            middleName: true,
                        },
                    },
                    statusHistory: {
                        orderBy: { id: "desc" },
                        include: {
                            changedBy: {
                                select: {
                                    id: true,
                                    firstName: true,
                                    middleName: true,
                                },
                            },
                        },
                    },
                },
            });
        }
        catch (err) {
            if (err?.code === 'P2022') {
                // fallback: load without statusHistory
                targetCase = await database_1.prisma.caseReport.findFirst({
                    where: {
                        id: caseId,
                        ...scopeWhere,
                    },
                    include: {
                        customer: {
                            select: { id: true, firstName: true, middleName: true, email: true },
                        },
                        assignedSupport: {
                            select: {
                                id: true,
                                firstName: true,
                                middleName: true,
                                email: true,
                                section: {
                                    select: {
                                        id: true,
                                        name: true,
                                        division: { select: { id: true, name: true } },
                                    },
                                },
                            },
                        },
                        updatedBy: { select: { id: true, firstName: true, middleName: true } },
                        closedBy: { select: { id: true, firstName: true, middleName: true } },
                        // statusHistory omitted in fallback
                    },
                });
                // ensure we don't break mapping later
                if (targetCase && !targetCase.statusHistory)
                    targetCase.statusHistory = [];
            }
            else {
                throw err;
            }
        }
        if (!targetCase) {
            throw new error_1.NotFoundError("Target case record not found or outside your authorized organizational hierarchy.");
        }
        const caseReport = targetCase;
        return res.status(200).json({
            success: true,
            data: {
                identity: {
                    id: caseReport.id,
                    caseNumber: caseReport.caseNumber,
                    subject: caseReport.subject,
                    creationReason: caseReport.creationReason,
                },
                lifecycle: {
                    status: caseReport.status,
                    priority: caseReport.priority,
                    createdAt: caseReport.createdAt,
                    updatedAt: caseReport.updatedAt,
                    resolvedAt: caseReport.resolvedAt,
                    closedAt: caseReport.closedAt,
                },
                actors: {
                    creatorCustomer: caseReport.customer
                        ? {
                            id: caseReport.customer.id,
                            name: `${caseReport.customer.firstName || ""} ${caseReport.customer.middleName || ""}`.trim(),
                            email: caseReport.customer.email,
                        }
                        : null,
                    assignedAgent: caseReport.assignedSupport
                        ? {
                            id: caseReport.assignedSupport.id,
                            name: `${caseReport.assignedSupport.firstName || ""} ${caseReport.assignedSupport.middleName || ""}`.trim(),
                            email: caseReport.assignedSupport.email,
                            departmentalScope: {
                                sectionName: caseReport.assignedSupport.section?.name || "Unassigned",
                                divisionName: caseReport.assignedSupport.section?.division?.name || "Unassigned",
                            },
                        }
                        : null,
                    lastUpdatedByStaff: caseReport.updatedBy
                        ? {
                            id: caseReport.updatedBy.id,
                            name: `${caseReport.updatedBy.firstName || ""} ${caseReport.updatedBy.middleName || ""}`.trim(),
                        }
                        : null,
                },
                resolution: caseReport.status === client_1.CaseStatus.CLOSED
                    ? {
                        summary: caseReport.resolutionSummary || "No explicit text provided.",
                        closedByStaff: caseReport.closedBy
                            ? `${caseReport.closedBy.firstName || ""} ${caseReport.closedBy.middleName || ""}`.trim()
                            : "System Loop",
                        customerFeedback: caseReport.customerFeedback || caseReport.feedback || null,
                    }
                    : null,
                auditTrail: (caseReport.statusHistory || []).map((history) => ({
                    historyId: history.id,
                    timestamp: history.createdAt ?? history.id,
                    transition: {
                        fromStatus: history.fromStatus ?? history.oldStatus,
                        toStatus: history.toStatus ?? history.newStatus,
                        fromPriority: history.oldPriority ?? null,
                        toPriority: history.newPriority ?? null,
                    },
                    executor: history.changedBy
                        ? `${history.changedBy.firstName || ""} ${history.changedBy.middleName || ""}`.trim()
                        : "System Automated System",
                })),
            },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getCaseDeepDetailProfile = getCaseDeepDetailProfile;
const getGlobalCaseMetrics = async (req, res, next) => {
    try {
        // primary (fast) path: aggregate counts in a single transaction
        const [totalCases, openCases, inProgressCases, resolvedCases, closedCases] = await database_1.prisma.$transaction([
            database_1.prisma.caseReport.count(),
            database_1.prisma.caseReport.count({ where: { status: client_1.CaseStatus.OPEN } }),
            database_1.prisma.caseReport.count({ where: { status: client_1.CaseStatus.IN_PROGRESS } }),
            database_1.prisma.caseReport.count({ where: { status: client_1.CaseStatus.CUSTOMER_CONFIRMATION } }),
            database_1.prisma.caseReport.count({ where: { status: client_1.CaseStatus.CLOSED } }),
        ]);
        return res.status(200).json({
            success: true,
            data: {
                total: totalCases,
                open: openCases,
                inProgress: inProgressCases,
                resolved: resolvedCases,
                closed: closedCases,
            },
        });
    }
    catch (error) {
        // Defensive fallback: if the primary aggregation fails (e.g., P2022 due to schema mismatch),
        // return best-effort counts per-status individually and avoid crashing the endpoint.
        try {
            console.warn('[getGlobalCaseMetrics] primary aggregation failed, falling back to best-effort counts:', error?.message || error);
            const safeCount = async (whereClause) => {
                try {
                    return await database_1.prisma.caseReport.count({ where: whereClause });
                }
                catch (e) {
                    // if any single count fails, return 0 for that metric rather than failing the whole endpoint
                    console.warn('[getGlobalCaseMetrics] safeCount failure:', e?.message || e);
                    return 0;
                }
            };
            const totalCases = await safeCount({});
            const openCases = await safeCount({ status: client_1.CaseStatus.OPEN });
            const inProgressCases = await safeCount({ status: client_1.CaseStatus.IN_PROGRESS });
            const resolvedCases = await safeCount({ status: client_1.CaseStatus.CUSTOMER_CONFIRMATION });
            const closedCases = await safeCount({ status: client_1.CaseStatus.CLOSED });
            return res.status(200).json({
                success: true,
                data: {
                    total: totalCases,
                    open: openCases,
                    inProgress: inProgressCases,
                    resolved: resolvedCases,
                    closed: closedCases,
                    warning: 'Returned best-effort metrics due to an internal aggregation error.',
                },
            });
        }
        catch (fallbackErr) {
            // If fallback also fails, forward the original error
            next(error);
        }
    }
};
exports.getGlobalCaseMetrics = getGlobalCaseMetrics;
const getAllCasesDeepDetail = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 20;
        const skip = (page - 1) * limit;
        let totalCount;
        let caseReports;
        try {
            [totalCount, caseReports] = await database_1.prisma.$transaction([
                database_1.prisma.caseReport.count(),
                database_1.prisma.caseReport.findMany({
                    skip,
                    take: limit,
                    orderBy: { createdAt: "desc" },
                    include: {
                        customer: {
                            select: {
                                id: true,
                                firstName: true,
                                middleName: true,
                                email: true,
                            },
                        },
                        assignedSupport: {
                            select: {
                                id: true,
                                firstName: true,
                                middleName: true,
                                email: true,
                                section: {
                                    select: {
                                        id: true,
                                        name: true,
                                        division: {
                                            select: { id: true, name: true },
                                        },
                                    },
                                },
                            },
                        },
                        updatedBy: {
                            select: {
                                id: true,
                                firstName: true,
                                middleName: true,
                            },
                        },
                        closedBy: {
                            select: {
                                id: true,
                                firstName: true,
                                middleName: true,
                            },
                        },
                        statusHistory: {
                            take: 5,
                            orderBy: { id: "desc" },
                            include: {
                                changedBy: {
                                    select: {
                                        id: true,
                                        firstName: true,
                                        middleName: true,
                                    },
                                },
                            },
                        },
                    },
                }),
            ]);
        }
        catch (err) {
            if (err?.code === 'P2022') {
                // fallback: load without statusHistory
                totalCount = await database_1.prisma.caseReport.count();
                caseReports = await database_1.prisma.caseReport.findMany({
                    skip,
                    take: limit,
                    orderBy: { createdAt: "desc" },
                    include: {
                        customer: {
                            select: { id: true, firstName: true, middleName: true, email: true },
                        },
                        assignedSupport: {
                            select: {
                                id: true,
                                firstName: true,
                                middleName: true,
                                email: true,
                                section: { select: { id: true, name: true, division: { select: { id: true, name: true } } } },
                            },
                        },
                        updatedBy: { select: { id: true, firstName: true, middleName: true } },
                        closedBy: { select: { id: true, firstName: true, middleName: true } },
                        // statusHistory omitted in fallback
                    },
                });
                // ensure mapping below won't break
                caseReports = caseReports.map((r) => ({ ...r, statusHistory: r.statusHistory || [] }));
            }
            else {
                throw err;
            }
        }
        const formattedCases = caseReports.map((caseReport) => ({
            identity: {
                id: caseReport.id,
                caseNumber: caseReport.caseNumber,
                subject: caseReport.subject,
                creationReason: caseReport.creationReason,
            },
            lifecycle: {
                status: caseReport.status,
                priority: caseReport.priority,
                createdAt: caseReport.createdAt,
                updatedAt: caseReport.updatedAt,
                resolvedAt: caseReport.resolvedAt,
                closedAt: caseReport.closedAt,
            },
            actors: {
                creatorCustomer: caseReport.customer
                    ? {
                        id: caseReport.customer.id,
                        name: `${caseReport.customer.firstName || ""} ${caseReport.customer.middleName || ""}`.trim(),
                        email: caseReport.customer.email,
                    }
                    : null,
                assignedAgent: caseReport.assignedSupport
                    ? {
                        id: caseReport.assignedSupport.id,
                        name: `${caseReport.assignedSupport.firstName || ""} ${caseReport.assignedSupport.middleName || ""}`.trim(),
                        email: caseReport.assignedSupport.email,
                        departmentalScope: {
                            sectionName: caseReport.assignedSupport.section?.name || "Unassigned",
                            divisionName: caseReport.assignedSupport.section?.division?.name || "Unassigned",
                        },
                    }
                    : null,
                lastUpdatedByStaff: caseReport.updatedBy
                    ? {
                        id: caseReport.updatedBy.id,
                        name: `${caseReport.updatedBy.firstName || ""} ${caseReport.updatedBy.middleName || ""}`.trim(),
                    }
                    : null,
            },
            resolution: caseReport.status === client_1.CaseStatus.CLOSED
                ? {
                    summary: caseReport.resolutionSummary || "No explicit text provided.",
                    closedByStaff: caseReport.closedBy
                        ? `${caseReport.closedBy.firstName || ""} ${caseReport.closedBy.middleName || ""}`.trim()
                        : "System Loop",
                    customerFeedback: caseReport.customerFeedback || caseReport.feedback || null,
                }
                : null,
            recentAuditTrail: caseReport.statusHistory.map((history) => ({
                historyId: history.id,
                timestamp: history.createdAt || history.id,
                transition: {
                    fromStatus: history.oldStatus,
                    toStatus: history.newStatus,
                    fromPriority: history.oldPriority,
                    toPriority: history.newPriority,
                },
                executor: history.changedBy
                    ? `${history.changedBy.firstName || ""} ${history.changedBy.middleName || ""}`.trim()
                    : "System Automated System",
            })),
        }));
        return res.status(200).json({
            success: true,
            pagination: {
                totalRecords: totalCount,
                currentPage: page,
                totalPages: Math.ceil(totalCount / limit),
                limit,
            },
            data: formattedCases,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getAllCasesDeepDetail = getAllCasesDeepDetail;
