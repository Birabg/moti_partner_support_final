import api from "./axios";

// ==========================
// PRODUCT CATEGORY
// ==========================

export const getCategories = () =>
    api.get("/product/categories/getAll");

export const getCategory = (id) =>
    api.get(`/product/categories/get/${id}`);

export const createCategory = (data) =>
    api.post("/product/categories/create", data);

export const updateCategory = (id, data) =>
    api.patch(`/product/categories/update/${id}`, data);

export const toggleCategoryStatus = (id, isActive) =>
    api.patch(`/product/categories/${id}/status`, { isActive });


// ==========================
// PRODUCT SUBCATEGORY
// ==========================

export const getSubcategories = () =>
    api.get("/product/subcategories/getAll");

export const getSubcategory = (id) =>
    api.get(`/product/subcategories/get/${id}`);

export const createSubcategory = (data) =>
    api.post("/product/subcategories/create", data);

export const updateSubcategory = (id, data) =>
    api.patch(`/product/subcategories/update/${id}`, data);

export const toggleSubcategoryStatus = (id, isActive) =>
    api.patch(`/product/subcategories/${id}/status`, { isActive });


// ==========================
// CUSTOM FIELDS
// ==========================
export const getCustomFields = () =>
    api.get("/product/customfields/getAll");


export const getCustomField = (id) =>
    api.get(`/product/customfields/get/${id}`);


export const createCustomField = (data) =>
    api.post(
        "/product/customfields/create",
        data
    );


export const updateCustomField = (id, data) =>
    api.patch(
        `/product/customfields/update/${id}`,
        data
    );


export const toggleCustomFieldStatus = (
    id,
    isActive
) =>
    api.patch(
        `/product/customfields/${id}/status`,
        {
            isActive
        }
    );


// ==========================
// SERVICE TYPES
// ==========================

export const getServiceTypes = () =>
    api.get("/service/servicetypes/getAll");

export const getServiceType = (id) =>
    api.get(`/service/servicetypes/get/${id}`);

export const createServiceType = (data) =>
    api.post("/service/servicetypes/create", data);

export const updateServiceType = (id, data) =>
    api.patch(`/service/servicetypes/update/${id}`, data);

export const toggleServiceTypeStatus = (id, isActive) =>
    api.patch(`/service/servicetypes/${id}/status`, { isActive });