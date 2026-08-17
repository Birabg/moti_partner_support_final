import { Router } from "express";
import { assignRole, revokeRole } from "./roleassignment.controller";
import { authenticateToken } from "../../middleware/auth.middleware";
import { requirePermission } from "../../middleware/rbac.middleware";

const router = Router();

router.use(authenticateToken);

router.patch("/update",requirePermission("STAFF_ASSIGN_ROLE"), assignRole);
router.patch("/revoke", requirePermission("STAFF_ASSIGN_ROLE"),revokeRole);

export const RoleRoute = router;
