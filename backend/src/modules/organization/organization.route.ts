import express from "express";
import { getAll, create, update, deactivate, reactivate, getSingle } from "./organization.controller";
import { authenticateToken } from "../../middleware/auth.middleware";
import { requirePermission } from "../../middleware/rbac.middleware";

const router = express.Router();

router.use(authenticateToken); 

router.get("/get/:id",requirePermission("ORGANIZATION_MANAGE"), getSingle);
router.get("/getAll",requirePermission("ORGANIZATION_MANAGE"), getAll);
router.post("/create",requirePermission("ORGANIZATION_MANAGE"), create);
router.patch("/update/:id",requirePermission("ORGANIZATION_MANAGE"), update);
router.patch("/:id/reactivate",requirePermission("ORGANIZATION_MANAGE"), reactivate);
router.patch("/:id/deactivate",requirePermission("ORGANIZATION_MANAGE"), deactivate);

export const OrganizationRouter = router;
 
 
