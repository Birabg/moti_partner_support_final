import { Router } from "express";
import * as DivisionController from "./division.controller";
import { authenticateToken } from "../../middleware/auth.middleware";
import { requirePermission } from "../../middleware/rbac.middleware";


const router = Router();

router.use(authenticateToken);

router.post("/create", requirePermission("STRUCTURE_MANAGE"), DivisionController.create);
router.patch("/update/:id",requirePermission("STRUCTURE_MANAGE"), DivisionController.update);
router.patch("/:id/deactivate",requirePermission("STRUCTURE_MANAGE"), DivisionController.deactivate);
router.patch("/:id/reactivate",requirePermission("STRUCTURE_MANAGE"), DivisionController.reactivate);
router.get("/getAll",requirePermission("STRUCTURE_READ_ALL"), DivisionController.getAll);
router.get("/get/:id",DivisionController.getSingle);

export const DivisionRoute = router;
