"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSubcategoryById = exports.getAllSubcategories = exports.setSubcategoryActiveStatus = exports.updateSubcategory = exports.createSubcategory = exports.getCategoryById = exports.getAllCategories = exports.setCategoryActiveStatus = exports.updateCategory = exports.createCategory = void 0;
const database_1 = require("../../config/database");
const error_1 = require("../../utils/error");
const createCategory = async (input) => {
    const { name, brandName, createdById } = input;
    const existing = await database_1.prisma.productCategory.findUnique({ where: { name } });
    if (existing) {
        throw new error_1.BadRequestError(`A category named '${name}' already exists.`);
    }
    return await database_1.prisma.productCategory.create({
        data: { name, brandName, createdById },
    });
};
exports.createCategory = createCategory;
const updateCategory = async (id, input) => {
    const { name, brandName, updatedById } = input;
    const category = await database_1.prisma.productCategory.findUnique({ where: { id } });
    if (!category)
        throw new error_1.NotFoundError("Target product category not found.");
    if (name && name !== category.name) {
        const existing = await database_1.prisma.productCategory.findUnique({
            where: { name },
        });
        if (existing) {
            throw new error_1.BadRequestError(`Category name '${name}' is already taken.`);
        }
    }
    return await database_1.prisma.productCategory.update({
        where: { id },
        data: { name, brandName, updatedById },
    });
};
exports.updateCategory = updateCategory;
const setCategoryActiveStatus = async (id, isActive, updatedById) => {
    const category = await database_1.prisma.productCategory.findUnique({ where: { id } });
    if (!category)
        throw new error_1.NotFoundError("Target product category not found.");
    return await database_1.prisma.$transaction(async (tx) => {
        if (!isActive) {
            await tx.productSubcategory.updateMany({
                where: { productCategoryId: id },
                data: { isActive: false, updatedById },
            });
        }
        return await tx.productCategory.update({
            where: { id },
            data: { isActive, updatedById },
        });
    });
};
exports.setCategoryActiveStatus = setCategoryActiveStatus;
const getAllCategories = async () => {
    return await database_1.prisma.productCategory.findMany({
        include: {
            subcategories: true,
        },
        orderBy: {
            createdAt: "desc",
        },
    });
};
exports.getAllCategories = getAllCategories;
const getCategoryById = async (id) => {
    const category = await database_1.prisma.productCategory.findUnique({
        where: { id },
        include: {
            subcategories: true,
            createdBy: { select: { id: true, firstName: true } },
            updatedBy: { select: { id: true, firstName: true } },
        },
    });
    if (!category)
        throw new error_1.NotFoundError("Product category not found.");
    return category;
};
exports.getCategoryById = getCategoryById;
const createSubcategory = async (input) => {
    const { name, productCategoryId, createdById } = input;
    const parent = await database_1.prisma.productCategory.findUnique({
        where: { id: productCategoryId, isActive: true },
    });
    if (!parent) {
        throw new error_1.NotFoundError("Parent category structure could not be verified.");
    }
    const existingSibling = await database_1.prisma.productSubcategory.findFirst({
        where: { name, productCategoryId },
    });
    if (existingSibling) {
        throw new error_1.BadRequestError(`A subcategory named '${name}' already exists inside this category.`);
    }
    return await database_1.prisma.productSubcategory.create({
        data: { name, productCategoryId, createdById },
    });
};
exports.createSubcategory = createSubcategory;
const updateSubcategory = async (id, input) => {
    const { name, productCategoryId, updatedById } = input;
    const subcategory = await database_1.prisma.productSubcategory.findUnique({
        where: { id },
    });
    if (!subcategory)
        throw new error_1.NotFoundError("Target subcategory not found.");
    const targetCategoryId = productCategoryId || subcategory.productCategoryId;
    if (name) {
        const existingSibling = await database_1.prisma.productSubcategory.findFirst({
            where: { name, productCategoryId: targetCategoryId, NOT: { id } },
        });
        if (existingSibling) {
            throw new error_1.BadRequestError(`A subcategory named '${name}' already exists inside the target category.`);
        }
    }
    return await database_1.prisma.productSubcategory.update({
        where: { id },
        data: { name, productCategoryId, updatedById },
    });
};
exports.updateSubcategory = updateSubcategory;
const setSubcategoryActiveStatus = async (id, isActive, updatedById) => {
    const subcategory = await database_1.prisma.productSubcategory.findUnique({
        where: { id },
    });
    if (!subcategory)
        throw new error_1.NotFoundError("Target subcategory not found.");
    if (isActive) {
        const parent = await database_1.prisma.productCategory.findUnique({
            where: { id: subcategory.productCategoryId },
        });
        if (parent && !parent.isActive) {
            throw new error_1.BadRequestError("Cannot activate subcategory while its parent category remains deactivated.");
        }
    }
    return await database_1.prisma.productSubcategory.update({
        where: { id },
        data: { isActive, updatedById },
    });
};
exports.setSubcategoryActiveStatus = setSubcategoryActiveStatus;
const getAllSubcategories = async () => {
    return await database_1.prisma.productSubcategory.findMany({
        include: {
            productCategory: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: "desc" },
    });
};
exports.getAllSubcategories = getAllSubcategories;
const getSubcategoryById = async (id) => {
    const subcategory = await database_1.prisma.productSubcategory.findUnique({
        where: { id },
        include: {
            productCategory: true,
            createdBy: { select: { id: true, firstName: true } },
            updatedBy: { select: { id: true, firstName: true } },
        },
    });
    if (!subcategory)
        throw new error_1.NotFoundError("Subcategory record not found.");
    return subcategory;
};
exports.getSubcategoryById = getSubcategoryById;
