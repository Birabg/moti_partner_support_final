import { Request, Response } from "express";
import {
  ForbiddenError,
  BadRequestError,
  NotFoundError,
} from "../../utils/error";
import { CasePriority } from "../../../generated/prisma/client"
import { prisma } from "../../config/database";
import { CaseStatus } from "../../../generated/prisma/client";
import {assignCaseSupport, updateCasePriority} from "./system_support.service"
import { processPriorityChangeNotifications } from "../cases/case.service";

interface OperatorWithScope {
  id: string;
  isSAdmin: boolean;
  role?: string; 
  managedDepartment: { id: string } | null;
  managedDivision: { id: string } | null;
  managedSection: { id: string } | null;
}

interface CaseWithAssignment {
  assignedSupportId: string | null;
}

export function hasStructuralAuthorization(actor: any, targetCase: any): boolean {
  const staff = actor.staffProfile || actor;
  if (!staff) return false;

  const caseSectionId = targetCase.productCategory?.sectionId;
  const caseDivisionId = targetCase.productCategory?.section?.divisionId;
  const caseDepartmentId = targetCase.productCategory?.section?.division?.departmentId;

  if (staff.managedSectionId && staff.managedSectionId === caseSectionId) {
    return true;
  }

  if (staff.managedDivisionId && staff.managedDivisionId === caseDivisionId) {
    return true;
  }

  if (staff.managedDepartmentId && staff.managedDepartmentId === caseDepartmentId) {
    return true;
  }

  return false;
}


export const assertCanAssignToStaff = async (
  operator: OperatorWithScope,
  targetCase: CaseWithAssignment,
  assignedSupportId: string
): Promise<void> => {
  if (operator.isSAdmin) return;

  if (operator.role === "SYSTEM_SUPPORT") {
    if (targetCase.assignedSupportId !== null) {
      throw new ForbiddenError(
        "System Support can only assign new, unassigned cases. This case is already assigned."
      );
    }
    return;
  }

  const targetStaff = await prisma.staff.findUnique({
    where: { id: assignedSupportId },
    include: {
      section: { include: { division: true } },
      managedSection: { include: { division: true } },
      managedDivision: true,
      managedDepartment: true,
    },
  });

  if (!targetStaff) throw new BadRequestError("Target staff member not found.");
  if (targetStaff.isSAdmin) throw new BadRequestError("A case cannot be assigned to a System Admin.");

  let targetSectionId: string | null = null;
  let targetDivisionId: string | null = null;
  let targetDepartmentId: string | null = null;

  if (targetStaff.managedSection) {
    targetSectionId = targetStaff.managedSection.id;
    targetDivisionId = targetStaff.managedSection.divisionId;
    targetDepartmentId = targetStaff.managedSection.division.departmentId;
  } else if (targetStaff.managedDivision) {
    targetDivisionId = targetStaff.managedDivision.id;
    targetDepartmentId = targetStaff.managedDivision.departmentId;
  } else if (targetStaff.managedDepartment) {
    targetDepartmentId = targetStaff.managedDepartment.id;
  } else if (targetStaff.isPSsupport && targetStaff.section) {
    targetSectionId = targetStaff.section.id;
    targetDivisionId = targetStaff.section.divisionId;
    targetDepartmentId = targetStaff.section.division.departmentId;
  } else {
    throw new BadRequestError("This staff member has no organizational placement and cannot receive cases.");
  }

  const operatorScope = operator.managedSection
    ? { level: "SECTION" as const, id: operator.managedSection.id }
    : operator.managedDivision
    ? { level: "DIVISION" as const, id: operator.managedDivision.id }
    : operator.managedDepartment
    ? { level: "DEPARTMENT" as const, id: operator.managedDepartment.id }
    : null;

  if (!operatorScope) {
    throw new ForbiddenError("You do not manage any organizational unit and cannot assign cases.");
  }

  const inScope =
    (operatorScope.level === "SECTION" && operatorScope.id === targetSectionId) ||
    (operatorScope.level === "DIVISION" && operatorScope.id === targetDivisionId) ||
    (operatorScope.level === "DEPARTMENT" && operatorScope.id === targetDepartmentId);

  if (!inScope) {
    throw new ForbiddenError("Access Denied: this staff member is outside the organizational unit you manage.");
  }
};

export const assertCanSetPriority = async (
  operator: OperatorWithScope,
  targetCase: CaseWithAssignment
): Promise<void> => {
  if (operator.isSAdmin) return;

  if (operator.role === "SYSTEM_SUPPORT") {
    if (targetCase.assignedSupportId !== null) {
      throw new ForbiddenError("System Support can only set priority on unassigned cases.");
    }
    return;
  }

  if (!targetCase.assignedSupportId) {
    throw new ForbiddenError("Only an admin or system support can set priority on an unassigned case.");
  }

  await assertCanAssignToStaff(operator, targetCase, targetCase.assignedSupportId);
};


export const AssignCase = async (req: Request, res: Response): Promise<void> => {
  try {
    const actor = (req as any).user;
    const caseId = req.params.id as string;
    const { assignedSupportId } = req.body;

    if (!assignedSupportId) {
      throw new BadRequestError("The assignedSupportId parameter is mandatory.");
    }

    if (!actor || !actor.userId) {
      throw new ForbiddenError("Access Denied: Invalid token credentials.");
    }

    const operator = await prisma.staff.findUnique({
      where: { id: actor.userId },
      include: {
        managedDepartment: { select: { id: true } },
        managedDivision: { select: { id: true } },
        managedSection: { select: { id: true } },
      },
    });

    if (!operator) {
      throw new ForbiddenError("Access Denied: Only staff members can route cases.");
    }

    const targetCase = await prisma.caseReport.findUnique({ where: { id: caseId } });
    if (!targetCase) {
      throw new NotFoundError("Case report record not found.");
    }
    await assertCanAssignToStaff(operator,targetCase, assignedSupportId);

    const result = await assignCaseSupport(caseId, assignedSupportId, operator.id, operator.isSystemSupport && !operator.isSAdmin,);

    res.status(200).json({
      message: "Case successfully routed to the assigned staff member.",
      data: result,
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};


export const UpdateCasePriority = async (req: Request, res: Response): Promise<void> => {
  try {
    const actor = (req as any).user;
    const caseId = req.params.id as string;
    const { priority } = req.body;

    if (!priority) throw new BadRequestError("priority is required.");
    if (!actor?.userId) throw new ForbiddenError("Access Denied: Invalid token credentials.");

    const operator = await prisma.staff.findUnique({
      where: { id: actor.userId },
      include: {
        managedDepartment: { select: { id: true } },
        managedDivision: { select: { id: true } },
        managedSection: { select: { id: true } },
      },
    });
    if (!operator) throw new ForbiddenError("Access Denied: Only staff members can set priority.");

    const targetCase = await prisma.caseReport.findUnique({ where: { id: caseId } });
    if (!targetCase) throw new NotFoundError("Case report record not found.");

    await assertCanSetPriority(operator, targetCase);

    const result = await updateCasePriority(caseId, priority, operator.id);

    res.status(200).json({ message: "Case priority updated.", data: result });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};
