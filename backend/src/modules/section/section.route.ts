import { Router } from "express";
import * as SectionController from "./section.controller";
import { authenticateToken } from "../../middleware/auth.middleware";
import { requirePermission } from "../../middleware/rbac.middleware";

const router = Router();

router.use(authenticateToken);


router.post("/create", requirePermission("STRUCTURE_MANAGE"),SectionController.create);
router.patch("/update/:id",  requirePermission("STRUCTURE_MANAGE"),SectionController.update);
router.patch("/:id/deactivate",  requirePermission("STRUCTURE_MANAGE"),SectionController.deactivate);
router.patch("/:id/reactivate", requirePermission("STRUCTURE_MANAGE"), SectionController.reactivate);

router.get("/getAll", requirePermission("STRUCTURE_READ_ALL"), SectionController.getAll);
router.get("/get/:id",SectionController.getSingle);

export const SectionRouter = router;
