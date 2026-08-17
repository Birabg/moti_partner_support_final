import { Request, Response, NextFunction } from "express";
import { prisma } from "../../../../config/database";
import { NotFoundError } from "../../../../utils/error";
import { CaseStatus } from "../../../../../generated/prisma/enums";
import { Prisma } from "../../../../../generated/prisma/client";

export const getActiveCustomersCount = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const activeCount = await prisma.customer.count({
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
  } catch (error) {
    next(error);
  }
};


export const getCustomerHistoryProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const customerId = req.params.customerId as string;

    let customer: any;

    try {
      customer = await prisma.customer.findUnique({
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
    } catch (err: any) {
      if (err?.code === 'P2022') {
        // fallback: load without statusHistory to avoid crashing when DB schema is out-of-sync
        customer = await prisma.customer.findUnique({
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
          customer.cases = customer.cases.map((c: any) => ({ ...c, statusHistory: c.statusHistory || [] }));
        }
      } else {
        throw err;
      }
    }

    if (!customer) {
      throw new NotFoundError("Target customer profile could not be located.");
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
  } catch (error) {
    next(error);
  }
};

export const getStaffMetricsCount = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const staffCount = await prisma.staff.count({
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
  } catch (error) {
    next(error);
  }
};

export const getStaffDeepDetailProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const staffId = req.params.staffId as string;

    const staffRecord = await prisma.staff.findUnique({
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
      throw new NotFoundError("Target staff member profile could not be located in the system.");
    }

    const agent = staffRecord as any;


    const activeCases = (agent.assignedCases || []).filter(
      (c: any) => c.status !== "RESOLVED" && c.status !== "CLOSED"
    );
    const completedCases = (agent.assignedCases || []).filter(
      (c: any) => c.status === "RESOLVED" || c.status === "CLOSED"
    );

    const totalAssignedHistorically = agent.assignedCases?.length || 0;
    const openCount = activeCases.filter((c: any) => c.status === "OPEN").length;
    const inProgressCount = activeCases.filter((c: any) => c.status === "IN_PROGRESS").length;
    const closedCount = completedCases.length;

    const ratedCases = completedCases.filter((c: any) => typeof c.rating === "number");
    const totalRatingSum = ratedCases.reduce((sum: number, c: any) => sum + c.rating, 0);
    const averageFeedbackRating =
      ratedCases.length > 0 ? parseFloat((totalRatingSum / ratedCases.length).toFixed(2)) : null;

  
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
    } else if (agent.managedSection) {
      structuralAssignment = {
        assignmentType: "SECTION_MANAGER",
        sectionId: agent.managedSection.id,
        sectionName: agent.managedSection.name,
        divisionId: agent.managedSection.division?.id || null,
        divisionName: agent.managedSection.division?.name || "Unassigned",
        departmentId: agent.managedSection.division?.department?.id || null,
        departmentName: agent.managedSection.division?.department?.name || "Unassigned",
      };
    } else if (agent.managedDivision) {
      structuralAssignment = {
        assignmentType: "DIVISION_MANAGER",
        sectionId: null,
        sectionName: null,
        divisionId: agent.managedDivision.id,
        divisionName: agent.managedDivision.name,
        departmentId: agent.managedDivision.department?.id || null,
        departmentName: agent.managedDivision.department?.name || "Unassigned",
      };
    } else if (agent.managedDepartment) {
      structuralAssignment = {
        assignmentType: "DEPARTMENT_MANAGER",
        sectionId: null,
        sectionName: null,
        divisionId: null,
        divisionName: null,
        departmentId: agent.managedDepartment.id,
        departmentName: agent.managedDepartment.name,
      };
    } else {
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
        historicalClosedList: completedCases.map((c: any) => ({
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
  } catch (error) {
    next(error);
  }
};



export interface UnifiedUser {
  id: string;
  userType: "STAFF" | "CUSTOMER";
  firstName: string;
  middleName?: string | null;
  lastName?: string | null;
  email: string;
  phoneNumber?: string | null;
  status: string;
  createdAt: Date;
  roleInfo?: {
    isManager: boolean;
    isPSsupport: boolean;
    isSAdmin: boolean;
    isDirector: boolean;
    department?: string | null;
    division?: string | null;
    section?: string | null;
  };
}



export const getActiveUsers = async (): Promise<UnifiedUser[]> => {
  const [activeStaff, activeCustomers] = await Promise.all([
    prisma.staff.findMany({
      where: { status: "ACTIVE" },
      include: {
        section: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.customer.findMany({
      where: { status: "ACTIVE" },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const formattedStaff: UnifiedUser[] = activeStaff.map((staff) => {
    const sec = (staff as any).section as { name: string } | null;
    const dept = (staff as any).department as { name: string } | null;
    const div = (staff as any).division as { name: string } | null;

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
        isDirector: (staff as any).isDirector ?? false,
        department: dept?.name ?? null,
        division: div?.name ?? null,
        section: sec?.name ?? null,
      },
    };
  });

  const formattedCustomers: UnifiedUser[] = activeCustomers.map((customer) => ({
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

  return [...formattedStaff, ...formattedCustomers].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
};


export const getActiveUsersHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const activeUsers = await getActiveUsers();
    return res.status(200).json({
      success: true,
      count: activeUsers.length,
      data: activeUsers,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllStaffUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const staff = await prisma.staff.findMany({
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
  } catch (error) {
    next(error);
  }
};


export const getAllCustomerUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const customers = await prisma.customer.findMany({
      orderBy: { createdAt: "desc" },
    });

    return res.status(200).json({
      success: true,
      count: customers.length,
      data: customers,
    });
  } catch (error) {
    next(error);
  }
};