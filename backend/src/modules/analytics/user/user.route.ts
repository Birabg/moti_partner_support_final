import { Router } from "express";
import { 
  getCustomerCaseloadAnalytics, 
  getPSSupportPerformanceAnalytics 
} from "./user.controller";
import { authenticateToken } from "../../../middleware/auth.middleware";


const router = Router();

router.use(authenticateToken);

router.get("/analytics/customers/caseload-performance", getCustomerCaseloadAnalytics);

router.get("/analytics/agent/performance-matrix", getPSSupportPerformanceAnalytics);

export const UserAnalyticsRouter = router;