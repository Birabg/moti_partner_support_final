import { Router } from "express";
import { 
  getOrganizationAnalytics, 
  getProductCatalogAnalytics, 
  getOrganizationListForDirector
} from "./org.controller";
import { requirePermission } from "../../../../middleware/rbac.middleware";

const router = Router();

router.get("/organization/summary", requirePermission("ORGANIZATION_MANAGE"), getOrganizationAnalytics);

// director-safe read-only organization list
router.get("/organization/list", getOrganizationListForDirector);

router.get("/products/categories",requirePermission("PRODUCT_READ_ALL"),  getProductCatalogAnalytics);

export const OrganizationAndProductAnalyticsRouter = router;