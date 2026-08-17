import { Router } from "express";
import {
  getActiveCustomersCount,
  getCustomerHistoryProfile,
  getStaffMetricsCount,
  getStaffDeepDetailProfile,
  getActiveUsers,
  getAllStaffUsers,
  getAllCustomerUsers,
  getActiveUsersHandler
} from "./user.controller";
import { requirePermission } from "../../../../middleware/rbac.middleware";

const router = Router();

router.get("/customers/metrics",requirePermission("CUSTOMER_READ_ALL"), getActiveCustomersCount);
router.get("/customers/:customerId", requirePermission("ACCESS_USER_DETAIL"), getCustomerHistoryProfile);
router.get("/all/metrics", requirePermission("USER_READ_STATS"), getActiveUsersHandler)
router.get("/staff/metrics",requirePermission("STAFF_READ_ALL"), getStaffMetricsCount);
router.get("/staff/:staffId", requirePermission("ACCESS_USER_DETAIL"), getStaffDeepDetailProfile);


export const AdminUserAnalyticsRouter = router;