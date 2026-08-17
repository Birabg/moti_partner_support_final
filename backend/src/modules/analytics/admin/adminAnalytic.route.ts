import Router from "express";
import { CaseAnalyticsRouter } from "./cases/cases.route";
import { FeedbackAnalyticsRouter } from "./feedback/feedback.route";
import { AdminUserAnalyticsRouter } from "./user/user.route";
import { StructureRouter } from "./structure/orgUnit.route";
import { OrganizationAndProductAnalyticsRouter } from "./org_and_product/org.route";
import { authenticateToken } from "../../../middleware/auth.middleware";


const router = Router();

router.use(authenticateToken);

router.use("/cases", CaseAnalyticsRouter);
router.use("/feedback", FeedbackAnalyticsRouter);
router.use("/user", AdminUserAnalyticsRouter);
router.use("/structures", StructureRouter);
router.use("/organdproduct", OrganizationAndProductAnalyticsRouter);
router.use("/cases/organdproduct", OrganizationAndProductAnalyticsRouter);

export const AdminAnalyticsRouter = router;