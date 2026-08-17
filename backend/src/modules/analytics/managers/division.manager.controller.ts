import { Request, Response, NextFunction } from "express";
import { Prisma } from "../../../../generated/prisma/client";
import { prisma } from "../../../config/database";
import { NotFoundError, ForbiddenError, UnauthorizedError } from "../../../utils/error";

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
} as const satisfies Prisma.DivisionInclude;

// 2. Infer Full Result Types for Map Callbacks
type DivisionWithRelations = Prisma.DivisionGetPayload<{
  include: typeof divisionAnalyticsInclude;
}>;

type SectionItem = DivisionWithRelations["sections"][number];
type StaffItem = SectionItem["staff"][number];

export const getDivisionAnalytics = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const actor = (req as any).user || (req as any).staff;

    if (!actor) {
      throw new UnauthorizedError("Authentication required.");
    }

    const isSystemAdmin = Boolean(actor.isSAdmin);

    const rawStaffId = actor.id || actor.userId || actor.staffId || actor._id;
    const staffId: string | undefined = typeof rawStaffId === "string" ? rawStaffId : undefined;

    if (!staffId) {
      throw new UnauthorizedError("User identifier missing from request context.");
    }

    let managedDivId: string | null = null;

    if (!isSystemAdmin) {
      const staffProfile = await prisma.staff.findUnique({
        where: { id: staffId },
        select: {
          managedDivision: {
            select: { id: true },
          },
        },
      });

      managedDivId = staffProfile?.managedDivision?.id || null;
    }

    let requestedDivId: string | undefined = undefined;
    if (typeof req.params.id === "string") {
      requestedDivId = req.params.id;
    } else if (typeof req.query.divisionId === "string") {
      requestedDivId = req.query.divisionId;
    }

    let targetDivId: string | null = requestedDivId || managedDivId;

    if (!isSystemAdmin) {
      if (!managedDivId) {
        throw new ForbiddenError(
          "Access Denied: You are not assigned as a Division Manager."
        );
      }

      if (requestedDivId && requestedDivId !== managedDivId) {
        throw new ForbiddenError(
          "Access Denied: You can only view analytics for your assigned division."
        );
      }

      targetDivId = managedDivId;
    }

    if (!targetDivId) {
      throw new NotFoundError("Division ID is required.");
    }

    const finalDivId: string = targetDivId;

    const divisionData = await prisma.division.findUnique({
      where: { id: finalDivId },
      include: divisionAnalyticsInclude,
    });

    if (!divisionData) {
      throw new NotFoundError("Division record not found.");
    }

    const division = divisionData as DivisionWithRelations;

    const cases = await prisma.caseReport.findMany({
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

    const casesByStatus = cases.reduce((acc: Record<string, number>, curr) => {
      acc[curr.status] = (acc[curr.status] || 0) + 1;
      return acc;
    }, {});

    let totalDivisionStaffCount = 0;

    const sectionDetails = division.sections.map((sec: SectionItem) => {
      const sectionStaff: StaffItem[] = sec.staff || [];
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
        staffMembers: sectionStaff.map((m: StaffItem) => ({
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
  } catch (error) {
    next(error);
  }
};