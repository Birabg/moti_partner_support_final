import { Request, Response, NextFunction } from "express";
import { Prisma } from "../../../../generated/prisma/client";
import { prisma } from "../../../config/database";
import { ForbiddenError, NotFoundError, UnauthorizedError } from "../../../utils/error";

const sectionAnalyticsInclude = {
  manager: {
    select: {
      id: true,
      firstName: true,
      middleName: true,
      lastName: true,
      email: true,
    },
  },
  division: {
    select: {
      id: true,
      name: true,
      department: {
        select: { id: true, name: true },
      },
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
} as const satisfies Prisma.SectionInclude;

type SectionWithRelations = Prisma.SectionGetPayload<{
  include: typeof sectionAnalyticsInclude;
}>;

type SectionStaffItem = SectionWithRelations["staff"][number];

export const getSectionAnalytics = async (
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

    let managedSecId: string | null = null;

    if (!isSystemAdmin) {
      const staffProfile = await prisma.staff.findUnique({
        where: { id: staffId },
        select: {
          managedSection: {
            select: { id: true },
          },
        },
      });

      managedSecId = staffProfile?.managedSection?.id || null;
    }

    let requestedSecId: string | undefined = undefined;
    if (typeof req.params.id === "string") {
      requestedSecId = req.params.id;
    } else if (typeof req.query.sectionId === "string") {
      requestedSecId = req.query.sectionId;
    }

    let targetSecId: string | null = requestedSecId || managedSecId;

    if (!isSystemAdmin) {
      if (!managedSecId) {
        throw new ForbiddenError(
          "Access Denied: You are not assigned as a Section Manager."
        );
      }

      if (requestedSecId && requestedSecId !== managedSecId) {
        throw new ForbiddenError(
          "Access Denied: You can only view analytics for your assigned section."
        );
      }

      targetSecId = managedSecId;
    }

    if (!targetSecId) {
      throw new NotFoundError("Section ID is required.");
    }

    const finalSecId: string = targetSecId;

    const sectionData = await prisma.section.findUnique({
      where: { id: finalSecId },
      include: sectionAnalyticsInclude,
    });

    if (!sectionData) {
      throw new NotFoundError("Section record not found.");
    }

    const section = sectionData as SectionWithRelations;

    const cases = await prisma.caseReport.findMany({
      where: {
        assignedSupport: {
          sectionId: finalSecId,
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

    const staffMembers = (section.staff || []).map((m: SectionStaffItem) => ({
      id: m.id,
      name: `${m.firstName} ${m.lastName || m.middleName || ""}`.trim(),
      email: m.email,
      isPSsupport: m.isPSsupport,
      isManager: m.isManager,
    }));

    const secManagerName = section.manager
      ? `${section.manager.firstName} ${section.manager.lastName || section.manager.middleName || ""}`.trim()
      : null;

    return res.status(200).json({
      success: true,
      data: {
        section: {
          id: section.id,
          name: section.name,
          manager: section.manager
            ? {
                id: section.manager.id,
                name: secManagerName,
                email: section.manager.email,
              }
            : null,
          parentDivision: section.division
            ? {
                id: section.division.id,
                name: section.division.name,
              }
            : null,
          parentDepartment: section.division?.department
            ? {
                id: section.division.department.id,
                name: section.division.department.name,
              }
            : null,
        },
        hierarchyMetrics: {
          totalSectionStaffCount: staffMembers.length,
          staffMembers,
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