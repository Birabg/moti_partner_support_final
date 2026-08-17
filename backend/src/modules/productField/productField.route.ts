import {
Router
}
from "express";


import {
authenticateToken
}
from "../../middleware/auth.middleware";


import {
requirePermission
}
from "../../middleware/rbac.middleware";


import {

createField,
updateField,
toggleStatus,
getBySubcategory,
deleteField

}
from "./productField.controller";



const router = Router();



router.use(
authenticateToken
);





router.post(

"/subcategories/:id/fields",

requirePermission(
"PRODUCT_MANAGER"
),

createField

);





router.get(

"/subcategories/:id/fields",

requirePermission(
"PRODUCT_READ_ALL"
),

getBySubcategory

);






router.patch(

"/fields/:id",

requirePermission(
"PRODUCT_MANAGER"
),

updateField

);





router.patch(

"/fields/:id/status",

requirePermission(
"PRODUCT_MANAGER"
),

toggleStatus

);





router.delete(

"/fields/:id",

requirePermission(
"PRODUCT_MANAGER"
),

deleteField

);




export const ProductFieldRouter =
router;