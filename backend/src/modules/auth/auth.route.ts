import { Router } from "express";
import { forgotPassword, login, logout, resetPassword, requestSigninHelp } from "./auth.controller";
import { AccountLockoutGuard } from "../../middleware/rateLimiter";
import { authenticateToken } from "../../middleware/auth.middleware";

const router = Router();

router.post("/login", AccountLockoutGuard, login);
router.post("/signin-help", requestSigninHelp);
router.post("/logout", logout);
router.post("/forgotpassword", forgotPassword);
router.post("/resetpassword", resetPassword);

export const AuthRoutes = router;
