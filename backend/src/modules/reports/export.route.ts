import { Router } from "express";
import {
    exportPdf,
    exportExcel,
    exportCsv,
} from "./export.controller";

import { authenticateToken } from "../../middleware/auth.middleware";
import { requirePermission } from "../../middleware/rbac.middleware";

const router = Router();

router.use(authenticateToken);

router.get(
    "/pdf",
    requirePermission("VIEW_ALL_CASES_DETAIL"),
    exportPdf
);

router.get(
    "/excel",
    requirePermission("VIEW_ALL_CASES_DETAIL"),
    exportExcel
);

router.get(
    "/csv",
    requirePermission("VIEW_ALL_CASES_DETAIL"),
    exportCsv
);

export const ReportsExportRouter = router;