"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCustomFieldById = exports.getAllCustomFields = exports.toggleCustomFieldStatus = exports.updateCustomField = exports.createCustomField = void 0;
const database_1 = require("../../config/database");
const error_1 = require("../../utils/error");
const createCustomField = async (data) => {
    const { name, fieldType, required, productSubcategoryId } = data;
    const subcategory = await database_1.prisma.productSubcategory.findUnique({
        where: {
            id: productSubcategoryId
        }
    });
    if (!subcategory) {
        throw new error_1.NotFoundError("Product subcategory not found");
    }
    const exists = await database_1.prisma.productCustomField.findFirst({
        where: {
            name,
            productSubcategoryId
        }
    });
    if (exists) {
        throw new error_1.BadRequestError("Custom field already exists");
    }
    return database_1.prisma.productCustomField.create({
        data: {
            name,
            fieldType,
            required,
            productSubcategoryId
        }
    });
};
exports.createCustomField = createCustomField;
const updateCustomField = async (id, data) => {
    const field = await database_1.prisma.productCustomField.findUnique({
        where: {
            id
        }
    });
    if (!field) {
        throw new error_1.NotFoundError("Custom field not found");
    }
    return database_1.prisma.productCustomField.update({
        where: {
            id
        },
        data
    });
};
exports.updateCustomField = updateCustomField;
const toggleCustomFieldStatus = async (id, isActive) => {
    const field = await database_1.prisma.productCustomField.findUnique({
        where: {
            id
        }
    });
    if (!field) {
        throw new error_1.NotFoundError("Custom field not found");
    }
    return database_1.prisma.productCustomField.update({
        where: {
            id
        },
        data: {
            isActive
        }
    });
};
exports.toggleCustomFieldStatus = toggleCustomFieldStatus;
const getAllCustomFields = async () => {
    return database_1.prisma.productCustomField.findMany({
        include: {
            productSubcategory: {
                select: {
                    id: true,
                    name: true
                }
            }
        },
        orderBy: {
            createdAt: "desc"
        }
    });
};
exports.getAllCustomFields = getAllCustomFields;
const getCustomFieldById = async (id) => {
    const field = await database_1.prisma.productCustomField.findUnique({
        where: {
            id
        },
        include: {
            productSubcategory: true
        }
    });
    if (!field) {
        throw new error_1.NotFoundError("Custom field not found");
    }
    return field;
};
exports.getCustomFieldById = getCustomFieldById;
