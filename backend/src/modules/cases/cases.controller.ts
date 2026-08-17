import { Request, Response } from "express";

import * as CaseService from "./case.service";
import * as CaseStatusService from "./caseStatus.service";
import {
  ForbiddenError,
  BadRequestError,
  NotFoundError,
} from "../../utils/error";
import { CasePriority } from "../../../generated/prisma/client"
import { prisma } from "../../config/database";
import multer from "multer"
import { CaseStatus } from "../../../generated/prisma/client";
import {processPriorityChangeNotifications} from "./case.service"


interface OperatorWithScope {
  id: string;
  isSAdmin: boolean;
  managedDepartment: { id: string } | null;
  managedDivision: { id: string } | null;
  managedSection: { id: string } | null;
}

export const getAllCases = async (

    req: Request,

    res: Response

): Promise<void> => {

    try {

        const page = Number(req.query.page) || 1;

        const limit = Number(req.query.limit) || 10;

        const sortBy = String(req.query.sortBy || "createdAt");

        const order =

            req.query.order === "asc"

                ? "asc"

                : "desc";

        const result = await CaseService.getAllCases(

            page,

            limit,

            sortBy,

            order

        );

        res.status(200).json({

            success: true,

            data: result.cases,

            pagination: result.pagination

        });

    }

    catch (error: any) {

        res.status(error.statusCode || 500).json({

            success: false,

            message: error.message

        });

    }

};

export const getCase = async (
    req: Request,
    res: Response
): Promise<void> => {

    try {

        const id = req.params.id as string;

const data = await CaseService.getCase(id);

        if (!data) {

            throw new NotFoundError("Case not found.");

        }

        res.status(200).json({

            message: "Case loaded successfully.",

            data

        });

    } catch (error: any) {

        res.status(error.statusCode || 500).json({

            message: error.message

        });

    }

};

export const assertCanAssignToStaff = async (
  operator: OperatorWithScope,
  assignedSupportId: string
): Promise<void> => {
  if (operator.isSAdmin) return;

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

  if (targetStaff.isSAdmin) {
    throw new BadRequestError("A case cannot be assigned to a System Admin.");
  }


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
    throw new BadRequestError(
      "This staff member has no organizational placement (no managed unit, no assigned section) and cannot receive cases."
    );
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
    throw new ForbiddenError(
      "Access Denied: this staff member is outside the organizational unit you manage."
    );
  }
};


const hasStructuralAuthorization = (
  operator: any,
  targetCase: any,
): boolean => {
  if (operator.isSAdmin) return true;
  if (!targetCase.assignedSupport) return false;

  const assignedAgent = targetCase.assignedSupport;

  const sectionMatch =
    operator.sectionId &&
    assignedAgent.sectionId &&
    operator.sectionId === assignedAgent.sectionId;
  const divisionMatch =
    operator.divisionId &&
    assignedAgent.divisionId &&
    operator.divisionId === assignedAgent.divisionId;
  const departmentMatch =
    operator.departmentId &&
    assignedAgent.departmentId &&
    operator.departmentId === assignedAgent.departmentId;

  return !!(sectionMatch || divisionMatch || departmentMatch);
};
const hasStructuralAuthorization2 = (actor: any, targetCase: any): boolean => {
  if (targetCase.assignedSupportId === actor.userId) {
    return true;
  }

  if (actor.role === "DEPARTMENT_MANAGER" && actor.departmentId) {
    return targetCase.departmentId === actor.departmentId;
  }

  if (actor.role === "DIVISION_MANAGER" && actor.divisionId) {
    return (
      targetCase.divisionId === actor.divisionId &&
      targetCase.departmentId === actor.departmentId
    );
  }

  if (actor.role === "SECTION_MANAGER" && actor.sectionId) {
    return (
      targetCase.sectionId === actor.sectionId &&
      targetCase.divisionId === actor.divisionId &&
      targetCase.departmentId === actor.departmentId
    );
  }

  return false;
};

export const createCustomerCase = async (req: Request, res: Response): Promise<void> => {
  try {
    const actor = (req as any).user;
    const customerId = actor?.id || actor?.userId;

    if (!customerId) {
      throw new ForbiddenError("Access Denied: Invalid token credentials.");
    }

    const customerRecord = await prisma.customer.findUnique({
      where: { id: customerId },
    });

    if (!customerRecord) {
      throw new ForbiddenError("Access Denied: Only customers can access this route.");
    }

    const {
      branchName,
      productCategoryId,
      productSubcategoryId,
      subject,
      description,
      serviceTypeId,
      attachments, 
    } = req.body;

    if (
      !branchName ||
      !productCategoryId ||
      !productSubcategoryId ||
      !subject ||
      !description ||
      !serviceTypeId
    ) {
      throw new BadRequestError("Missing core parameters needed to initialize Case Report.");
    }

    const parsedAttachments = Array.isArray(req.files) 
      ? (req.files as Express.Multer.File[]).map((file) => ({
          fileName: file.originalname,
          storagePath: file.path || file.filename,
          fileSizeBytes: file.size,
          mimeType: file.mimetype,
        }))
      : attachments || [];

    const result = await CaseService.createCase({
      branchName,
      customerId,
      productCategoryId,
      productSubcategoryId,
      subject,
      description,
      serviceTypeId,
      attachments: parsedAttachments,
    });

    res.status(201).json({
      message: "Case Report initialized successfully.",
      data: result,
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

export const createAdminCase = async (req: Request, res: Response): Promise<void> => {
  try {
    const actor = (req as any).user;
    const staffId = actor?.id || actor?.userId;

    if (!staffId) {
      throw new ForbiddenError("Access Denied: Invalid token credentials.");
    }

    const staffRecord = await prisma.staff.findUnique({
      where: { id: staffId },
    });

    if (!staffRecord || (!staffRecord.isSAdmin && !staffRecord.isManager)) {
      throw new ForbiddenError(
        "Access Denied: Only System Administrators or Managers can log a case on behalf of a customer."
      );
    }

    const {
      customerEmail,
      reason,
      branchName,
      productCategoryId,
      productSubcategoryId,
      subject,
      description,
      serviceTypeId,
      attachments,
    } = req.body;

    if (
      !customerEmail ||
      !reason ||
      !branchName ||
      !productCategoryId ||
      !productSubcategoryId ||
      !subject ||
      !description ||
      !serviceTypeId
    ) {
      throw new BadRequestError(
        "Missing required fields: customerEmail, reason, and all core case parameters are mandatory."
      );
    }

    if (typeof reason !== "string" || reason.trim().length < 5) {
      throw new BadRequestError(
        "Validation Failure: Please provide a valid reason for creating this case (at least 5 characters)."
      );
    }

    const targetCustomer = await prisma.customer.findUnique({
      where: { email: customerEmail.trim().toLowerCase() },
    });

    if (!targetCustomer) {
      throw new NotFoundError(`No customer account found with email: ${customerEmail}`);
    }

    const rawFiles = (req as any).files as Express.Multer.File[] | undefined;

    const parsedAttachments = Array.isArray(rawFiles)
      ? rawFiles.map((file) => ({
          fileName: file.originalname,
          storagePath: file.path || file.filename,
          fileSizeBytes: file.size,
          mimeType: file.mimetype,
        }))
      : attachments || [];

    const result = await CaseService.createCase({
      branchName,
      customerId: targetCustomer.id,
      productCategoryId,
      productSubcategoryId,
      subject,
      description,
      serviceTypeId,
      creationReason: reason.trim(),
      staffActorId: staffId,
      attachments: parsedAttachments,
    });

    res.status(201).json({
      message: "Case Report logged on behalf of customer.",
      data: result,
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

export const AssignCase = async (req: Request, res: Response): Promise<void> => {
  try {
    const actor = (req as any).user;
    const caseId = req.params.id as string;
    const { assignedSupportId } = req.body;

    if (!assignedSupportId) {
      throw new BadRequestError("The assignedSupportId parameter is mandatory.");
    }

    if (!actor || (!actor.userId && !actor.id)) {
      throw new ForbiddenError("Access Denied: Invalid token credentials.");
    }

    const staffId = actor.userId || actor.id;

    const operator = await prisma.staff.findUnique({
      where: { id: staffId },
      include: {
        managedDepartment: { select: { id: true } },
        managedDivision: { select: { id: true } },
        managedSection: { select: { id: true } },
      },
    });

    if (!operator) {
      throw new ForbiddenError("Access Denied: Only staff members can route cases.");
    }

    let managerType: "DEPARTMENT" | "DIVISION" | "SECTION" | "DIRECTOR" | undefined;
    if (operator.managedDepartment) managerType = "DEPARTMENT";
    else if (operator.managedDivision) managerType = "DIVISION";
    else if (operator.managedSection) managerType = "SECTION";

    const operatorPayload = {
      id: operator.id,
      isSAdmin: operator.isSAdmin,
      isManager: operator.isManager,
      managerType,
      departmentId: operator.managedDepartment?.id || (operator as any).departmentId,
      divisionId: operator.managedDivision?.id || (operator as any).divisionId,
      sectionId: operator.managedSection?.id || (operator as any).sectionId,
    };

    const result = await CaseService.assignCaseSupport(
      caseId, 
      assignedSupportId, 
      operatorPayload
    );

    res.status(200).json({
      message: "Case successfully routed to the assigned staff member.",
      data: result,
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};
export const ReassignCase = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const actor = (req as any).user;
    const caseId = req.params.id as string;
    const { assignedSupportId } = req.body;

    if (!assignedSupportId) {
      throw new BadRequestError(
        "The assignedSupportId parameter is mandatory.",
      );
    }

    if (!actor || (!actor.userId && !actor.id)) {
      throw new ForbiddenError("Access Denied: Invalid token credentials.");
    }

    const staffId = actor.userId || actor.id;

    const operator = await prisma.staff.findUnique({
      where: { id: staffId },
      include: {
        managedDepartment: true,
        managedDivision: true,
        managedSection: true,
      },
    });

    if (!operator) {
      throw new ForbiddenError(
        "Access Denied: Only staff members can route cases.",
      );
    }


    let managerType: "DEPARTMENT" | "DIVISION" | "SECTION" | "DIRECTOR" | undefined;
    if (operator.managedDepartment) managerType = "DEPARTMENT";
    else if (operator.managedDivision) managerType = "DIVISION";
    else if (operator.managedSection) managerType = "SECTION";

    const operatorPayload = {
      id: operator.id,
      isSAdmin: operator.isSAdmin,
      isManager: operator.isManager,
      managerType,
      departmentId: operator.managedDepartment?.id || (operator as any).departmentId,
      divisionId: operator.managedDivision?.id || (operator as any).divisionId,
      sectionId: operator.managedSection?.id || (operator as any).sectionId,
    };

    const result = await CaseService.reassignOpenCase(
      caseId,
      assignedSupportId,
      operatorPayload
    );

    res.status(200).json({
      message: "Case successfully routed to the assigned staff member.",
      data: result,
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};
export const GivePriority = async (req: Request, res: Response): Promise<void> => {
  try {
    const actor = (req as any).user;
    const caseId = req.params.id as string;
    const { priority } = req.body;

    if (!priority || !Object.values(CasePriority).includes(priority)) {
      throw new BadRequestError("A valid CasePriority enum flag must be passed.");
    }

    if (!actor || (!actor.userId && !actor.id)) {
      throw new ForbiddenError("Access Denied: Invalid token credentials.");
    }

    const staffId = actor.userId || actor.id;

    const operator = await prisma.staff.findUnique({
      where: { id: staffId },
      include: {
        managedDepartment: { select: { id: true } },
        managedDivision: { select: { id: true } },
        managedSection: { select: { id: true } },
      },
    });

    if (!operator) {
      throw new ForbiddenError("Access Denied: Only staff members can modify case priority.");
    }

    let managerType: "DEPARTMENT" | "DIVISION" | "SECTION" | "DIRECTOR" | undefined;
    if (operator.managedDepartment) managerType = "DEPARTMENT";
    else if (operator.managedDivision) managerType = "DIVISION";
    else if (operator.managedSection) managerType = "SECTION";

    const operatorPayload = {
      id: operator.id,
      isSAdmin: operator.isSAdmin,
      isManager: operator.isManager,
      isSystemSupport: operator.isSystemSupport, // FIX: added — was never passed, blocking System Support entirely
      managerType,
      departmentId: operator.managedDepartment?.id,
      divisionId: operator.managedDivision?.id,
      sectionId: operator.managedSection?.id,
    };

    const updatedCase = await CaseService.givePriority(caseId, priority as CasePriority, operatorPayload);

    // FIX: removed the second processPriorityChangeNotifications call
    // entirely. The service already sends the correct notification
    // internally, with the real pre-update oldPriority. This duplicate
    // call used updatedCase.priority — which is the NEW value, since the
    // update had already happened — so it was sending "changed from X to
    // X" as a second, wrong notification on every single request.

    res.status(200).json({
      message: `Case priority successfully updated to ${priority}.`,
      data: updatedCase,
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};



export const resolveCase = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const caseId = id;
    const actor = (req as any).user;
    const agentId = actor?.id || actor?.userId;

    if (!agentId) {
      throw new ForbiddenError("Access Denied: Invalid staff token credentials.");
    }

    const { resolutionSummary } = req.body;

    if (!resolutionSummary) {
      throw new BadRequestError("A formal resolution summary payload is required to resolve this case.");
    }

    const result = await CaseService.resolveCase(caseId, resolutionSummary, agentId);

    res.status(200).json({
      message: "Case report marked as RESOLVED. Verification notice dispatched to customer.",
      data: result,
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};


export const closeCaseWithFeedback = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const caseId = id;

    const actor = (req as any).user;
    const customerId = actor?.id || actor?.userId;

    if (!customerId) {
      throw new ForbiddenError("Access Denied: Invalid customer token credentials.");
    }

    const { rating, comment } = req.body;

    if (rating === undefined || rating === null) {
      throw new BadRequestError("A customer satisfaction score rating parameter is required.");
    }

    const parsedRating = parseInt(rating, 10);
    if (isNaN(parsedRating) || parsedRating < 1 || parsedRating > 5) {
      throw new BadRequestError("Validation Failure: Rating metrics must be an integer between 1 and 5.");
    }
    
    const result = await CaseService.closeCaseWithFeedback(
      caseId,
      parsedRating,
      comment,
      customerId
    );

    res.status(200).json({
      message: "Feedback submitted successfully. Case file marked as CLOSED.",
      data: result,
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};


export const rejectedCase = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string 
    const caseId = id;
    const actor = (req as any).user;
    const customerId = actor?.id || actor?.userId;

    if (!customerId) {
      throw new ForbiddenError("Access Denied: Invalid customer token credentials.");
    }

    const result = await CaseService.reopenCase(caseId, customerId);

    res.status(200).json({
      message: "Resolution rejected. Case file successfully returned to active status queue.",
      data: result,
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};
export const getSupportStaff = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {

        const staff = await prisma.staff.findMany({
            where: {
                isPSsupport: true,
                status: "ACTIVE"
            },
            orderBy: {
                firstName: "asc"
            },
            select: {
                id: true,
                firstName: true,
                middleName: true,
                lastName: true,
                email: true
            }
        });

        res.status(200).json({
            success: true,
            data: staff
        });

    } catch (error: any) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
};

export const updateStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const actor = (req as any).user;
    if (!actor || (!actor.userId && !actor.id)) {
      throw new ForbiddenError("Access Denied: Invalid token credentials.");
    }

    const newStatus = req.body.status as any;
    const reason = req.body.reason as string | undefined;
    const note = req.body.note as string | undefined;
    const resolutionSummary = req.body.resolutionSummary as string | undefined;

    if (!newStatus) {
      throw new BadRequestError("A target status is required.");
    }

    const actorId = actor.userId || actor.id;

    // Add role flags when available on the token
    const actorPayload: any = { id: actorId };
    if (actor.isSAdmin) actorPayload.isSAdmin = true;
    if (actor.isPSsupport) actorPayload.isPSsupport = true;
    if (actor.isManager) actorPayload.isManager = true;
    if (actor.isDirector) actorPayload.isDirector = true;

    const result = await CaseStatusService.updateStatus(id, newStatus, actorPayload, { reason, note, resolutionSummary });

    res.status(200).json({ message: `Case status updated to ${newStatus}.`, data: result });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};