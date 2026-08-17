import { Router } from "express";
import * as StaffPermissionController from "./staff.permission.controller";
import { authenticateToken } from "../../middleware/auth.middleware";
import { requirePermission } from "../../middleware/rbac.middleware";


const router = Router();

router.use(authenticateToken);


router.patch(
  "/grant",
  requirePermission("PERMISSION_DELEGATE"),
  StaffPermissionController.grant
);


router.patch(
  "/revoke",
  requirePermission("PERMISSION_DELEGATE"),
  StaffPermissionController.revoke
);

router.put(
  "/sync",
  requirePermission("PERMISSION_DELEGATE"),
  StaffPermissionController.sync
);
router.get("/default-role-permission",requirePermission("PERMISSION_DELEGATE"), StaffPermissionController.getDefaultPermissionsForRole )
router.get("/getAll",requirePermission("PERMISSION_DELEGATE"), StaffPermissionController.getAllPermissions)

export const PermissionRoute = router;