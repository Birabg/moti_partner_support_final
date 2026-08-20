import { Router } from "express";
import { DepartmentRoute } from "../modules/department/department.route";
import { SectionRouter } from "../modules/section/section.route";
import { DivisionRoute } from "../modules/division/devision.route";
import { RoleRoute } from "../modules/roleassignment/roleassignment.route";
import { ApprovalRouter } from "../modules/approval/approval.route";
import { AuthRoutes } from "../modules/auth/auth.route";
import { StaffRoutes } from "../modules/staff/staff.route";
import { CustomerRoute } from "../modules/customer/customer.route";
import { UserProfile } from "../modules/users/users.route";
import { ServiceTypeRouter } from "../modules/service/serviceType.route";
import { ProductRouter } from "../modules/product_category/product.Category.route";
import { CaseReportRouter } from "../modules/cases/case.route";
import { NotificationRouter } from "../modules/notifications/notification.route";
import { AdminAnalyticsRouter } from "../modules/analytics/admin/adminAnalytic.route";
import { UserAnalyticsRouter } from "../modules/analytics/user/user.route";
import { OrganizationRouter } from "../modules/organization/organization.route";
import { ManagerRoute } from "../modules/analytics/managers/manager.route";
import { PermissionRoute } from "../modules/permission/staff.permission.route";
import { ReportsExportRouter } from "../modules/reports";
import {
ProductFieldRouter
}
from "../modules/productField/productField.route";
import {
ProductCustomFieldRouter
}
from "../modules/productCustomField/productCustomField.route";

const router = Router();

// Register debug routes only in non-production environments
if (process.env.NODE_ENV !== 'production') {
  // lazy require to avoid loading in production
  const { DebugRouter } = require('../modules/debug/debug.route');
  router.use('/debug', DebugRouter);
}


router.use("/auth", AuthRoutes);
router.use("/staff", StaffRoutes);
router.use("/customer", CustomerRoute);
router.use("/user", UserProfile);
router.use("/service", ServiceTypeRouter);
router.use("/product", ProductRouter);
router.use("/cases", CaseReportRouter);
router.use("/notification", NotificationRouter);
router.use("/organization", OrganizationRouter);
router.use("/manager", ManagerRoute)
router.use("/permissions", PermissionRoute)
router.use("/reports/export", ReportsExportRouter);
router.use(
"/api/product",
ProductFieldRouter
);
router.use(
"/product",
ProductCustomFieldRouter
);
const PrivateRoute = Router();

PrivateRoute.use("/pro/admin/approval", ApprovalRouter);
PrivateRoute.use("/pro/report", AdminAnalyticsRouter);
PrivateRoute.use("/pro/admin/role", RoleRoute);
PrivateRoute.use("/pro/department", DepartmentRoute);
PrivateRoute.use("/pro/admin/service", ServiceTypeRouter);
PrivateRoute.use("/pro/division", DivisionRoute);
PrivateRoute.use("/pro/section", SectionRouter);
PrivateRoute.use("/pro/user", UserAnalyticsRouter);


router.use("/", PrivateRoute);

export const ApiRouter = router;
