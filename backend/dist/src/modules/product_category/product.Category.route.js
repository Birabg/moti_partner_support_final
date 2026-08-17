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
exports.ProductRouter = void 0;
const express_1 = require("express");
const category = __importStar(require("./productCategory.controller"));
const auth_middleware_1 = require("../../middleware/auth.middleware");
const rbac_middleware_1 = require("../../middleware/rbac.middleware");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticateToken);
router.get("/categories/getAll", category.fetchAllCategories);
router.get("/categories/get/:id", (0, rbac_middleware_1.requirePermission)("PRODUCT_READ_ALL"), category.fetchCategoryById);
router.post("/categories/create", (0, rbac_middleware_1.requirePermission)("PRODUCT_MANAGER"), category.createCategory);
router.patch("/categories/update/:id", (0, rbac_middleware_1.requirePermission)("PRODUCT_MANAGER"), category.updateCategory);
router.patch("/categories/:id/status", (0, rbac_middleware_1.requirePermission)("PRODUCT_MANAGER"), category.toggleCategoryActive);
router.get("/subcategories/getAll", category.fetchAllSubcategories);
router.get("/subcategories/get/:id", (0, rbac_middleware_1.requirePermission)("PRODUCT_READ_ALL"), category.fetchSubcategoryById);
router.post("/subcategories/create", (0, rbac_middleware_1.requirePermission)("PRODUCT_MANAGER"), category.createSubcategory);
router.patch("/subcategories/update/:id", (0, rbac_middleware_1.requirePermission)("PRODUCT_MANAGER"), category.updateSubcategory);
router.patch("/subcategories/:id/status", (0, rbac_middleware_1.requirePermission)("PRODUCT_MANAGER"), category.toggleSubcategoryActive);
exports.ProductRouter = router;
