"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.CaseReportRouter = void 0;
const express_1 = require("express");
const cases = __importStar(require("./cases.controller"));
const CaseService = __importStar(require("./case.service"));
const auth_middleware_1 = require("../../middleware/auth.middleware");
const rbac_middleware_1 = require("../../middleware/rbac.middleware");
const default_permission_1 = require("../../config/default.permission");
const upload_middleware_1 = require("../../middleware/upload.middleware");
const error_1 = require("../../utils/error");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticateToken);
router.get("/", (0, rbac_middleware_1.requirePermission)(default_permission_1.PERMISSIONS.CASE_READ_ALL), cases.getAllCases);
const requireCaseReadAccess = async (req, res, next) => {
    try {
        const caseId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        if (req.user?.partyType === "CUSTOMER") {
            const caseData = await CaseService.getCase(caseId);
            if (!caseData) {
                throw new error_1.NotFoundError("Case not found.");
            }
            const customerId = req.user?.userId;
            if (!customerId || caseData.customerId !== customerId) {
                throw new error_1.ForbiddenError("Access Denied: You are not allowed to view this case.");
            }
            return next();
        }
        return (0, rbac_middleware_1.requirePermission)(default_permission_1.PERMISSIONS.CASE_READ_ALL, default_permission_1.PERMISSIONS.CASE_READ_HIERARCHY)(req, res, next);
    }
    catch (error) {
        return next(error);
    }
};
router.get("/:id", requireCaseReadAccess, cases.getCase);
router.post("/create", upload_middleware_1.upload.array("attachments"), cases.createCustomerCase);
router.post("/auth/create", upload_middleware_1.upload.array("attachments"), (0, rbac_middleware_1.requirePermission)("CASE_CREATE"), cases.createAdminCase);
router.patch("/:id/assign", (0, rbac_middleware_1.requirePermission)("CASE_ASSIGN"), cases.AssignCase);
router.patch("/:id/status", cases.updateStatus);
router.post("/:id/confirm-resolution", cases.updateStatus);
router.patch("/:id/reassign", (0, rbac_middleware_1.requirePermission)("CASE_ASSIGN"), cases.ReassignCase);
router.patch("/give/:id/priority", (0, rbac_middleware_1.requirePermission)("CASE_SET_PRIORITY"), cases.GivePriority);
router.patch("/:id/resolve", (0, rbac_middleware_1.requirePermission)("CASE_RESOLVE"), cases.resolveCase);
router.post("/close/:id/feedback-close", cases.closeCaseWithFeedback);
router.post("/rejectedcase/:id", cases.rejectedCase);
exports.CaseReportRouter = router;
