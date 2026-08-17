import { Router } from "express";
import {
  register,
  resendVerification,
  verifyEmail,
  getCustomerHistoryProfile,
} from "./customer.controller";
import { authenticateToken } from "../../middleware/auth.middleware";

const PrivateRouter = Router();

PrivateRouter.use(authenticateToken);
PrivateRouter.get("/analytics", getCustomerHistoryProfile);

const router = Router();

router.post("/register", register);
router.post("/verify-email", verifyEmail);
router.post("/resend-verification", resendVerification);
// router.get("/my-history", handleGetCustomerHistory);
// router.get("/:customerId/history", handleGetCustomerHistory);
router.use("/", PrivateRouter)


export const CustomerRoute = router;
