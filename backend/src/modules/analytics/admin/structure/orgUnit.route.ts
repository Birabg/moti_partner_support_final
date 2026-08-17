import { Router } from "express";
import {
  getDivisionAnalytics,
  getDepartmentAnalytics,
  getSectionAnalytics,
  getServiceTypesList,
  getDepartmentAnalyticsId
} from "./orgUnit.controller";
import { requirePermission } from "../../../../middleware/rbac.middleware";

const router = Router();

router.get("/divisions",requirePermission("STRUCTURE_READ_ALL"), getDivisionAnalytics);
router.get("/departments",requirePermission("STRUCTURE_READ_ALL"), getDepartmentAnalytics);
router.get("/sections",requirePermission("STRUCTURE_READ_ALL"), getSectionAnalytics);

router.get("/servicetypes",  requirePermission("SERVICE_MANAGE"),getServiceTypesList);

export const StructureRouter = router;