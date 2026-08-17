import { Router } from "express";
import * as ApprovalController from "./approval.controller";
import { authenticateToken } from "../../middleware/auth.middleware";

const router = Router();

router.use(authenticateToken);


router.get("/getPending", ApprovalController.getPendingList);
router.post("/approve", ApprovalController.approveUser);
router.post("/reject", ApprovalController.rejectUser);
router.patch("/reactivate", ApprovalController.reactivateUser);
router.patch("/deactivate", ApprovalController.deactivateUser);

export const ApprovalRouter = router;
