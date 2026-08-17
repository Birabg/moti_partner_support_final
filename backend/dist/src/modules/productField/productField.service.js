"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteField = exports.getFieldsBySubcategory = exports.changeStatus = exports.updateField = exports.createField = void 0;
const database_1 = require("../../config/database");
const error_1 = require("../../utils/error");
const createField = async (data) => {
    const subcategory = await database_1.prisma.productSubcategory.findUnique({
        where: {
            id: data.productSubcategoryId
        }
    });
    if (!subcategory) {
        throw new error_1.NotFoundError("Product subcategory not found");
    }
    return database_1.prisma.productCustomField.create({
        data
    });
};
exports.createField = createField;
const updateField = async (id, data) => {
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
exports.updateField = updateField;
const changeStatus = async (id, isActive) => {
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
exports.changeStatus = changeStatus;
const getFieldsBySubcategory = async (subcategoryId) => {
    return database_1.prisma.productCustomField.findMany({
        where: {
            productSubcategoryId: subcategoryId
        },
        orderBy: {
            createdAt: "desc"
        }
    });
};
exports.getFieldsBySubcategory = getFieldsBySubcategory;
const deleteField = async (id) => {
    const field = await database_1.prisma.productCustomField.findUnique({
        where: {
            id
        }
    });
    if (!field) {
        throw new error_1.NotFoundError("Custom field not found");
    }
    return database_1.prisma.productCustomField.delete({
        where: {
            id
        }
    });
};
exports.deleteField = deleteField;
