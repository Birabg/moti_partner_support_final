import { Router } from "express";
import { getDepartmentAnalytics } from "../admin/structure/orgUnit.controller";
import { getDivisionAnalytics } from "./division.manager.controller";
import { getSectionAnalytics } from "./section.manger.controller";
import { getDepartmentAnalyticsId } from "./department.manager.controller";
import { authenticateToken } from "../../../middleware/auth.middleware";

const router = Router()

router.use(authenticateToken)

router.get("/:id/department", getDepartmentAnalyticsId)
router.get("/:id/division", getDivisionAnalytics)
router.get("/:id/section", getSectionAnalytics)

export const ManagerRoute = router

