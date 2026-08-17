import { Router } from "express";
import * as service from "./serviceType.controller";
import { authenticateToken } from "../../middleware/auth.middleware"
import { requirePermission } from "../../middleware/rbac.middleware";

const router = Router();

router.use(authenticateToken);

router.get(
"/servicetypes/getAll",
service.FetchAllServiceTypes
);

router.get(
"/servicetypes/get/:id",
service.FetchServiceTypeById
);

router.post("/servicetypes/create", requirePermission("SERVICE_MANAGE"),service.CreateServiceType);
router.patch("/servicetypes/update/:id",requirePermission("SERVICE_MANAGE"), service.UpdateServiceType);
router.patch("/servicetypes/:id/status",requirePermission("SERVICE_MANAGE"), service.ToggleServiceTypeActive);

export const ServiceTypeRouter = router;
