"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchSubcategoryById = exports.fetchAllSubcategories = exports.toggleSubcategoryActive = exports.updateSubcategory = exports.createSubcategory = exports.fetchCategoryById = exports.fetchAllCategories = exports.toggleCategoryActive = exports.updateCategory = exports.createCategory = void 0;
const CatalogService = __importStar(require("./productCategory.service"));
const error_1 = require("../../utils/error");
// Helper to reliably retrieve authenticated user ID from request
const getUserId = (req) => {
    const user = req.user;
    return user?.id || user?.userId;
};
const createCategory = async (req, res, next) => {
    try {
        const userId = getUserId(req);
        const { name, brandName } = req.body;
        if (!name)
            throw new error_1.BadRequestError("Category name parameter missing.");
        const result = await CatalogService.createCategory({
            name,
            brandName,
            createdById: userId,
        });
        res.status(201).json({
            message: "Product category created successfully.",
            data: result,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.createCategory = createCategory;
const updateCategory = async (req, res, next) => {
    try {
        const userId = getUserId(req);
        const id = req.params.id;
        const { name, brandName } = req.body;
        const result = await CatalogService.updateCategory(id, {
            name,
            brandName,
            updatedById: userId,
        });
        res.status(200).json({
            message: "Product category updated successfully.",
            data: result,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.updateCategory = updateCategory;
const toggleCategoryActive = async (req, res, next) => {
    try {
        const userId = getUserId(req);
        const id = req.params.id;
        const { isActive } = req.body;
        if (typeof isActive !== "boolean") {
            throw new error_1.BadRequestError("isActive parameter must be a boolean flag.");
        }
        const result = await CatalogService.setCategoryActiveStatus(id, isActive, userId);
        res.status(200).json({
            message: isActive
                ? "Category activated successfully."
                : "Category deactivated.",
            data: result,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.toggleCategoryActive = toggleCategoryActive;
const fetchAllCategories = async (req, res, next) => {
    try {
        const result = await CatalogService.getAllCategories();
        res.status(200).json({ data: result });
    }
    catch (error) {
        next(error);
    }
};
exports.fetchAllCategories = fetchAllCategories;
const fetchCategoryById = async (req, res, next) => {
    try {
        const id = req.params.id;
        const result = await CatalogService.getCategoryById(id);
        res.status(200).json({ data: result });
    }
    catch (error) {
        next(error);
    }
};
exports.fetchCategoryById = fetchCategoryById;
const createSubcategory = async (req, res, next) => {
    try {
        const userId = getUserId(req);
        const { name, productCategoryId } = req.body;
        if (!name || !productCategoryId) {
            throw new error_1.BadRequestError("Missing required payload parameters.");
        }
        const result = await CatalogService.createSubcategory({
            name,
            productCategoryId,
            createdById: userId,
        });
        res.status(201).json({
            message: "Subcategory registered successfully.",
            data: result,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.createSubcategory = createSubcategory;
const updateSubcategory = async (req, res, next) => {
    try {
        const userId = getUserId(req);
        const id = req.params.id;
        const { name, productCategoryId } = req.body;
        const result = await CatalogService.updateSubcategory(id, {
            name,
            productCategoryId,
            updatedById: userId,
        });
        res.status(200).json({
            message: "Subcategory context updated successfully.",
            data: result,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.updateSubcategory = updateSubcategory;
const toggleSubcategoryActive = async (req, res, next) => {
    try {
        const userId = getUserId(req);
        const id = req.params.id;
        const { isActive } = req.body;
        if (typeof isActive !== "boolean") {
            throw new error_1.BadRequestError("isActive parameter must be a boolean flag.");
        }
        const result = await CatalogService.setSubcategoryActiveStatus(id, isActive, userId);
        res.status(200).json({
            message: `Subcategory active flag toggled to ${isActive}.`,
            data: result,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.toggleSubcategoryActive = toggleSubcategoryActive;
const fetchAllSubcategories = async (req, res, next) => {
    try {
        const result = await CatalogService.getAllSubcategories();
        res.status(200).json({ data: result });
    }
    catch (error) {
        next(error);
    }
};
exports.fetchAllSubcategories = fetchAllSubcategories;
const fetchSubcategoryById = async (req, res, next) => {
    try {
        const id = req.params.id;
        const result = await CatalogService.getSubcategoryById(id);
        res.status(200).json({ data: result });
    }
    catch (error) {
        next(error);
    }
};
exports.fetchSubcategoryById = fetchSubcategoryById;
