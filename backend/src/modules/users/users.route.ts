import { Router } from "express";
import {
  updateMyProfile,
  adminUpdateUserEmail,
  getAllApprovedUsers,
  getUserById,
  updateUserByAdmin,
  getUserPermissions,
} from "./users.controller";

import { authenticateToken } from "../../middleware/auth.middleware";
import { requirePermission } from "../../middleware/rbac.middleware";

const router = Router();

router.use(authenticateToken);

router.patch(
  "/own/updateProfile",
  updateMyProfile
);

router.patch(
  "/update/:id",
  requirePermission("USER_UPDATE_ANY"),
  adminUpdateUserEmail
);

router.get(
  "/all-approved",
  requirePermission("USER_READ_ALL"),
  getAllApprovedUsers
);

router.get(
  "/:id",
  requirePermission("USER_READ_ALL"),
  getUserById
);

router.put(
  "/:id",
  requirePermission("USER_UPDATE_ANY"),
  updateUserByAdmin
);

router.get(
  "/:id/permissions",
  requirePermission("PERMISSION_DELEGATE"),
  getUserPermissions
);

export const UserProfile = router;