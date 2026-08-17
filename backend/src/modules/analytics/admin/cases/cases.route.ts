import { Router } from "express";
import { 
  getCaseSummaryMetrics, 
  getCaseDeepDetailProfile , getGlobalCaseMetrics, getAllCasesDeepDetail
} from "./cases.controller";
import { requirePermission } from "../../../../middleware/rbac.middleware";

const router = Router();

router.get(
  "/metrics/all",
  requirePermission("VIEW_ALL_CASES_METRICS"),
  getGlobalCaseMetrics
);
router.get("/deepall",requirePermission("VIEW_ALL_CASES_DETAIL") ,getAllCasesDeepDetail)
router.get("/count", requirePermission("VIEW_ALL_CASES_METRICS"), getCaseSummaryMetrics)
router.get("/casesdetail/:caseId",requirePermission("VIEW_ALL_CASES_DETAIL") , getCaseDeepDetailProfile);

export const CaseAnalyticsRouter = router;