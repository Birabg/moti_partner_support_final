import {Router} from "express";

import * as field from "./productCustomField.controller";

import {
authenticateToken
} from "../../middleware/auth.middleware";


import {
requirePermission
} from "../../middleware/rbac.middleware";



const router = Router();



router.use(authenticateToken);




router.get(
"/customfields/getAll",

requirePermission("PRODUCT_READ_ALL"),

field.getAllCustomFields
);




router.get(
"/customfields/get/:id",

requirePermission("PRODUCT_READ_ALL"),

field.getCustomField
);




router.post(
"/customfields/create",

requirePermission("PRODUCT_MANAGER"),

field.createCustomField
);





router.patch(
"/customfields/update/:id",

requirePermission("PRODUCT_MANAGER"),

field.updateCustomField
);





router.patch(
"/customfields/:id/status",

requirePermission("PRODUCT_MANAGER"),

field.toggleStatus
);





export const ProductCustomFieldRouter = router;