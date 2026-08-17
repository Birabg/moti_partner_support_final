"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrganizationAndProductAnalyticsRouter = void 0;
const express_1 = require("express");
const org_controller_1 = require("./org.controller");
const rbac_middleware_1 = require("../../../../middleware/rbac.middleware");
const router = (0, express_1.Router)();
router.get("/organization/summary", (0, rbac_middleware_1.requirePermission)("ORGANIZATION_MANAGE"), org_controller_1.getOrganizationAnalytics);
// director-safe read-only organization list
router.get("/organization/list", org_controller_1.getOrganizationListForDirector);
router.get("/products/categories", (0, rbac_middleware_1.requirePermission)("PRODUCT_READ_ALL"), org_controller_1.getProductCatalogAnalytics);
exports.OrganizationAndProductAnalyticsRouter = router;
