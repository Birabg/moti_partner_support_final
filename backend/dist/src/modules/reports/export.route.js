"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportsExportRouter = void 0;
const express_1 = require("express");
const export_controller_1 = require("./export.controller");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const error_1 = require("../../utils/error");
const router = (0, express_1.Router)();
const allowCustomerOrPermission = (requiredPermission) => {
    return (req, res, next) => {
        const actor = req.user;
        if (!actor) {
            return next(new error_1.ForbiddenError("Authentication token context unavailable."));
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
        return next(new error_1.ForbiddenError("Access Denied: Missing required permission clearance."));
    };
};
router.use(auth_middleware_1.authenticateToken);
router.get("/pdf", allowCustomerOrPermission("VIEW_ALL_CASES_DETAIL"), export_controller_1.exportPdf);
router.get("/excel", allowCustomerOrPermission("VIEW_ALL_CASES_DETAIL"), export_controller_1.exportExcel);
router.get("/csv", allowCustomerOrPermission("VIEW_ALL_CASES_DETAIL"), export_controller_1.exportCsv);
exports.ReportsExportRouter = router;
