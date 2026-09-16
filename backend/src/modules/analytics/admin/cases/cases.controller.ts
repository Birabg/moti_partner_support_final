import { Request, Response, NextFunction } from "express";
import { prisma } from "../../../../config/database";
import { CaseStatus } from "../../../../../generated/prisma/client";
import { NotFoundError, ForbiddenError } from "../../../../utils/error";


import { Prisma } from "../../../../../generated/prisma/client";

export const buildHierarchyWhereClause = (actor: any): Prisma.CaseReportWhereInput => {
 
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



export const getCaseSummaryMetrics = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const actor = (req as any).user;
    if (!actor) {
      throw new ForbiddenError("Access Denied: Authentication required.");
    }

    const scopeWhere = buildHierarchyWhereClause(actor);

    const [
      totalCases,
      openCases,
      inProgressCases,
      pendingCases,
      escalatedCases,
      resolvedCases,
      customerConfirmationCases,
      closedCases,
    ] = await prisma.$transaction([
      prisma.caseReport.count({ where: scopeWhere }),
      prisma.caseReport.count({ where: { ...scopeWhere, status: CaseStatus.OPEN } }),
      prisma.caseReport.count({
        where: {
          ...scopeWhere,
          OR: [
            { status: CaseStatus.IN_PROGRESS },
            { status: CaseStatus.ASSIGNED },
          ],
        },
      }),
      prisma.caseReport.count({ where: { ...scopeWhere, status: CaseStatus.PENDING } }),
      prisma.caseReport.count({ where: { ...scopeWhere, status: CaseStatus.ESCALATED } }),
      prisma.caseReport.count({ where: { ...scopeWhere, status: CaseStatus.RESOLVED } }),
      prisma.caseReport.count({ where: { ...scopeWhere, status: CaseStatus.CUSTOMER_CONFIRMATION } }),
      prisma.caseReport.count({ where: { ...scopeWhere, status: CaseStatus.CLOSED } }),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        total: totalCases,
        open: openCases,
        inProgress: inProgressCases,
        pending: pendingCases,
        escalated: escalatedCases,
        resolved: resolvedCases,
        customerConfirmation: customerConfirmationCases,
        closed: closedCases,
      },
    });
  } catch (error) {
    next(error);
  }
};


export const getCaseDeepDetailProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const actor = (req as any).user;
    if (!actor) {
      throw new ForbiddenError("Access Denied: Authentication required.");
    }

    const caseId = req.params.caseId as string;
    const scopeWhere = buildHierarchyWhereClause(actor);

 
    // attempt to load the full target case including statusHistory; if DB schema is missing status history columns fall back to a safer query without the include
    let targetCase: any;
    try {
      targetCase = await prisma.caseReport.findFirst({
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
    } catch (err: any) {
      if (err?.code === 'P2022') {
        // fallback: load without statusHistory
        targetCase = await prisma.caseReport.findFirst({
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
        if (targetCase && !targetCase.statusHistory) targetCase.statusHistory = [];
      } else {
        throw err;
      }
    }

    if (!targetCase) {
      throw new NotFoundError("Target case record not found or outside your authorized organizational hierarchy.");
    }

    const caseReport = targetCase as any;

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
        resolution:
          caseReport.status === CaseStatus.CLOSED
            ? {
                summary: caseReport.resolutionSummary || "No explicit text provided.",
                closedByStaff: caseReport.closedBy
                  ? `${caseReport.closedBy.firstName || ""} ${caseReport.closedBy.middleName || ""}`.trim()
                  : "System Loop",
                customerFeedback: caseReport.customerFeedback || caseReport.feedback || null,
              }
            : null,
        auditTrail: (caseReport.statusHistory || []).map((history: any) => ({
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
  } catch (error) {
    next(error);
  }
};



export const getGlobalCaseMetrics = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // primary (fast) path: aggregate counts in a single transaction
    const [totalCases, openCases, inProgressCases, resolvedCases, closedCases] =
      await prisma.$transaction([
        prisma.caseReport.count(),
        prisma.caseReport.count({ where: { status: CaseStatus.OPEN } }),
        prisma.caseReport.count({ where: { status: CaseStatus.IN_PROGRESS } }),
        prisma.caseReport.count({ where: { status: CaseStatus.CUSTOMER_CONFIRMATION } }),
        prisma.caseReport.count({ where: { status: CaseStatus.CLOSED } }),
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
  } catch (error: any) {
    // Defensive fallback: if the primary aggregation fails (e.g., P2022 due to schema mismatch),
    // return best-effort counts per-status individually and avoid crashing the endpoint.
    try {
      console.warn('[getGlobalCaseMetrics] primary aggregation failed, falling back to best-effort counts:', error?.message || error);

      const safeCount = async (whereClause: any) => {
        try {
          return await prisma.caseReport.count({ where: whereClause });
        } catch (e: any) {
          // if any single count fails, return 0 for that metric rather than failing the whole endpoint
          console.warn('[getGlobalCaseMetrics] safeCount failure:', e?.message || e);
          return 0;
        }
      };

      const totalCases = await safeCount({});
      const openCases = await safeCount({ status: CaseStatus.OPEN });
      const inProgressCases = await safeCount({ status: CaseStatus.IN_PROGRESS });
      const resolvedCases = await safeCount({ status: CaseStatus.CUSTOMER_CONFIRMATION });
      const closedCases = await safeCount({ status: CaseStatus.CLOSED });

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
    } catch (fallbackErr) {
      // If fallback also fails, forward the original error
      next(error);
    }
  }
};


export const getAllCasesDeepDetail = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 20;
    const skip = (page - 1) * limit;

    let totalCount: number;
    let caseReports: any[];

    try {
      [totalCount, caseReports] = await prisma.$transaction([
        prisma.caseReport.count(),
        prisma.caseReport.findMany({
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
    } catch (err: any) {
      if (err?.code === 'P2022') {
        // fallback: load without statusHistory
        totalCount = await prisma.caseReport.count();
        caseReports = await prisma.caseReport.findMany({
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
        caseReports = caseReports.map((r: any) => ({ ...r, statusHistory: r.statusHistory || [] }));
      } else {
        throw err;
      }
    }

    const formattedCases = caseReports.map((caseReport: any) => ({
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
      resolution:
        caseReport.status === CaseStatus.CLOSED
          ? {
              summary: caseReport.resolutionSummary || "No explicit text provided.",
              closedByStaff: caseReport.closedBy
                ? `${caseReport.closedBy.firstName || ""} ${caseReport.closedBy.middleName || ""}`.trim()
                : "System Loop",
              customerFeedback: caseReport.customerFeedback || caseReport.feedback || null,
            }
          : null,
      recentAuditTrail: caseReport.statusHistory.map((history: any) => ({
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
  } catch (error) {
    next(error);
  }
};