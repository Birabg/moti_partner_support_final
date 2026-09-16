import { Router } from "express";
import {
    exportPdf,
    exportExcel,
    exportCsv,
} from "./export.controller";

import { authenticateToken } from "../../middleware/auth.middleware";
import { ForbiddenError } from "../../utils/error";

const router = Router();

const allowCustomerOrPermission = (requiredPermission: string) => {
    return (req: any, res: any, next: any) => {
        const actor = req.user;

        if (!actor) {
            return next(new ForbiddenError("Authentication token context unavailable."));
        }

        if (actor.partyType === "CUSTOMER") {
            return next();
        }

        if (actor.partyType === "STAFF" && actor.isSAdmin) {
            return next();
        }

        const permissions = actor.permissions || [];
        if (permissions.includes(requiredPermission)) {
            return next();
        }

        return next(new ForbiddenError("Access Denied: Missing required permission clearance."));
    };
};

router.use(authenticateToken);

router.get(
    "/pdf",
    allowCustomerOrPermission("VIEW_ALL_CASES_DETAIL"),
    exportPdf
);

router.get(
    "/excel",
    allowCustomerOrPermission("VIEW_ALL_CASES_DETAIL"),
    exportExcel
);

router.get(
    "/csv",
    allowCustomerOrPermission("VIEW_ALL_CASES_DETAIL"),
    exportCsv
);

export const ReportsExportRouter = router;