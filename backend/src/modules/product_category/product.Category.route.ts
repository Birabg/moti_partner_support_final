import { Router } from "express";
import * as category from "./productCategory.controller";
import { authenticateToken } from "../../middleware/auth.middleware";
import { requirePermission } from "../../middleware/rbac.middleware";

const router = Router();

router.use(authenticateToken);

router.get(
  "/categories/getAll",
  category.fetchAllCategories
);
router.get("/categories/get/:id",requirePermission("PRODUCT_READ_ALL"),  category.fetchCategoryById);
router.post(
  "/categories/create", requirePermission("PRODUCT_MANAGER"),
  category.createCategory,
);
router.patch(
  "/categories/update/:id", requirePermission("PRODUCT_MANAGER"),
  category.updateCategory,
);
router.patch(
  "/categories/:id/status",requirePermission("PRODUCT_MANAGER"),
  category.toggleCategoryActive,
);

router.get(
  "/subcategories/getAll",
  category.fetchAllSubcategories
);
router.get("/subcategories/get/:id",requirePermission("PRODUCT_READ_ALL"),  category.fetchSubcategoryById);
router.post(
  "/subcategories/create", requirePermission("PRODUCT_MANAGER"),
  category.createSubcategory,
);
router.patch(
  "/subcategories/update/:id", requirePermission("PRODUCT_MANAGER"),
  category.updateSubcategory,
);
router.patch(
  "/subcategories/:id/status", requirePermission("PRODUCT_MANAGER"),
  category.toggleSubcategoryActive,
);

export const ProductRouter = router;
