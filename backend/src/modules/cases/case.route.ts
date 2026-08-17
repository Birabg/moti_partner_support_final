import { Router, Request, Response, NextFunction } from "express";
import * as cases from "./cases.controller";
import * as CaseService from "./case.service";
import { authenticateToken } from "../../middleware/auth.middleware";
import { requirePermission } from "../../middleware/rbac.middleware";
import { PERMISSIONS } from "../../config/default.permission";
import { upload } from "../../middleware/upload.middleware";
import { NotFoundError, ForbiddenError } from "../../utils/error";

const router = Router();

router.use(authenticateToken);

router.get(
  "/",
  requirePermission(PERMISSIONS.CASE_READ_ALL),
  cases.getAllCases
);

const requireCaseReadAccess = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const caseId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    if (req.user?.partyType === "CUSTOMER") {
      const caseData = await CaseService.getCase(caseId);
      if (!caseData) {
        throw new NotFoundError("Case not found.");
      }

      const customerId = req.user?.userId;
      if (!customerId || caseData.customerId !== customerId) {
        throw new ForbiddenError("Access Denied: You are not allowed to view this case.");
      }

      return next();
    }

    return requirePermission(PERMISSIONS.CASE_READ_ALL, PERMISSIONS.CASE_READ_HIERARCHY)(req, res, next);
  } catch (error) {
    return next(error);
  }
};

router.get(
  "/:id",
  requireCaseReadAccess,
  cases.getCase
);

router.post(
  "/create",
  upload.array("attachments"),
  cases.createCustomerCase
);

router.post(
  "/auth/create",
  upload.array("attachments"),
  requirePermission("CASE_CREATE"),
  cases.createAdminCase
);

router.patch(
  "/:id/assign",
  requirePermission("CASE_ASSIGN"),
  cases.AssignCase
);

router.patch(
  "/:id/status",
  cases.updateStatus
);

router.post(
  "/:id/confirm-resolution",
  cases.updateStatus
);

router.patch(
  "/:id/reassign",
  requirePermission("CASE_ASSIGN"),
  cases.ReassignCase
);

router.patch(
  "/give/:id/priority",
  requirePermission("CASE_SET_PRIORITY"),
  cases.GivePriority
);

router.patch(
  "/:id/resolve",
  requirePermission("CASE_RESOLVE"),
  cases.resolveCase
);

router.post(
  "/close/:id/feedback-close",
  cases.closeCaseWithFeedback
);

router.post(
  "/rejectedcase/:id",
  cases.rejectedCase
);

export const CaseReportRouter = router;