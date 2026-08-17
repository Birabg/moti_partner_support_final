import { Router } from "express";
import {
    register,
    verifyEmail,
    resendVerification,
    getStaffDeepDetailProfile,
    getStaffFeedbackAnalytics,
    getAllSupportStaff
} from "./staff.controller";

import { authenticateToken } from "../../middleware/auth.middleware";

const PrivateRouter = Router();

PrivateRouter.use(authenticateToken);

PrivateRouter.get("/analyze", getStaffDeepDetailProfile);

PrivateRouter.get(
    "/feedback/analytics",
    getStaffFeedbackAnalytics
);

PrivateRouter.get(
    "/support",
    getAllSupportStaff
);

const router = Router();

router.post("/register", register);

router.post("/verify-email", verifyEmail);

router.post("/resend-verification", resendVerification);

router.use("/", PrivateRouter);

export const StaffRoutes = router;