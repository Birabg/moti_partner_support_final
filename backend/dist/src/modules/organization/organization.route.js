"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrganizationRouter = void 0;
const express_1 = __importDefault(require("express"));
const organization_controller_1 = require("./organization.controller");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const rbac_middleware_1 = require("../../middleware/rbac.middleware");
const router = express_1.default.Router();
router.use(auth_middleware_1.authenticateToken);
router.get("/get/:id", (0, rbac_middleware_1.requirePermission)("ORGANIZATION_MANAGE"), organization_controller_1.getSingle);
router.get("/getAll", (0, rbac_middleware_1.requirePermission)("ORGANIZATION_MANAGE"), organization_controller_1.getAll);
router.post("/create", (0, rbac_middleware_1.requirePermission)("ORGANIZATION_MANAGE"), organization_controller_1.create);
router.patch("/update/:id", (0, rbac_middleware_1.requirePermission)("ORGANIZATION_MANAGE"), organization_controller_1.update);
router.patch("/:id/reactivate", (0, rbac_middleware_1.requirePermission)("ORGANIZATION_MANAGE"), organization_controller_1.reactivate);
router.patch("/:id/deactivate", (0, rbac_middleware_1.requirePermission)("ORGANIZATION_MANAGE"), organization_controller_1.deactivate);
exports.OrganizationRouter = router;
