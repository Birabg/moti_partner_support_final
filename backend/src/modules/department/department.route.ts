import { Router } from "express";
import * as DeptController from "./department.controller";
import { authenticateToken } from "../../middleware/auth.middleware";
import { requirePermission } from "../../middleware/rbac.middleware";

const router = Router();

router.use(authenticateToken);

router.get("/getAll", requirePermission("STRUCTURE_READ_ALL"), DeptController.getAll);
router.post("/", requirePermission("STRUCTURE_MANAGE"), DeptController.create);
router.get("/:id", requirePermission("STRUCTURE_READ_OWN"), DeptController.getSingle);
router.put("/:id", requirePermission("STRUCTURE_MANAGE"), DeptController.update);
router.patch("/:id/deactivate", requirePermission("STRUCTURE_MANAGE"), DeptController.deactivate);
router.patch("/:id/reactivate", requirePermission("STRUCTURE_MANAGE"), DeptController.reactivate);




export const DepartmentRoute = router;
