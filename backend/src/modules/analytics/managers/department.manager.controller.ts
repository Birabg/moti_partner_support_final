import { Request, Response, NextFunction } from "express";
import { prisma } from "../../../config/database";
import { NotFoundError, ForbiddenError, UnauthorizedError } from "../../../utils/error";

export const getDepartmentAnalyticsId = async (
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

const staffId = actor.id || actor.userId || actor.staffId || actor._id;

if (!staffId) {
  throw new UnauthorizedError("User identifier missing from request context.");
}

let managedDeptId: string | null = null;

if (!isSystemAdmin) {
  const staffProfile = await prisma.staff.findUnique({
    where: { id: staffId }, 
    select: {
      managedDepartment: {
        select: { id: true },
      },
    },
  });

  managedDeptId = staffProfile?.managedDepartment?.id || null;
}

const requestedDeptId = req.params.id as string;
let targetDeptId = requestedDeptId || managedDeptId;

if (!isSystemAdmin) {
  if (!managedDeptId) {
    throw new ForbiddenError(
      "Access Denied: You are not assigned as a Department Manager."
    );
  }

  if (requestedDeptId && requestedDeptId !== managedDeptId) {
    throw new ForbiddenError(
      "Access Denied: You can only view analytics for your assigned department."
    );
  }

  targetDeptId = managedDeptId;
}

if (!targetDeptId) {
  throw new NotFoundError("Department ID is required.");
}

    const department = await prisma.department.findUnique({
      where: { id: targetDeptId },
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
        divisions: {
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
                    isSAdmin: true,
                    isManager: true,
                    isPSsupport: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!department) {
      throw new NotFoundError("Department record not found.");
    }

    const cases = await prisma.caseReport.findMany({
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

    let totalStaffCount = 0;
    const divisionDetails = department.divisions.map((div) => {
      const sectionDetails = div.sections.map((sec) => {
        const staffList = sec.staff || [];
        totalStaffCount += staffList.length;

        const secManagerName = sec.manager
          ? `${sec.manager.firstName} ${sec.manager.lastName || sec.manager.middleName}`.trim()
          : null;

        return {
          id: sec.id,
          name: sec.name,
          manager: secManagerName,
          staffCount: staffList.length,
          staffMembers: staffList.map((m) => ({
            id: m.id,
            name: `${m.firstName} ${m.lastName || m.middleName}`.trim(),
            email: m.email,
            isSAdmin: m.isSAdmin,
            isManager: m.isManager,
            isPSsupport: m.isPSsupport,
          })),
        };
      });

      const divManagerName = div.manager
        ? `${div.manager.firstName} ${div.manager.lastName || div.manager.middleName}`.trim()
        : null;

      return {
        id: div.id,
        name: div.name,
        manager: divManagerName,
        sectionsCount: div.sections.length,
        sections: sectionDetails,
      };
    });

    const deptManagerName = department.manager
      ? `${department.manager.firstName} ${department.manager.lastName || department.manager.middleName}`.trim()
      : null;

    // 6. Return Structured Response
    return res.status(200).json({
      success: true,
      data: {
        department: {
          id: department.id,
          name: department.name,
          manager: department.manager
            ? {
                id: department.manager.id,
                name: deptManagerName,
                email: department.manager.email,
              }
            : null,
        },
        hierarchyMetrics: {
          totalDivisionsCount: department.divisions.length,
          totalSectionsCount: divisionDetails.reduce(
            (acc, div) => acc + div.sectionsCount,
            0
          ),
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
  } catch (error) {
    next(error);
  }
};