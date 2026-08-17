"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDepartmentById = exports.getAllDepartments = exports.setDepartmentStatus = exports.updateDepartment = exports.createDepartment = void 0;
const database_1 = require("../../config/database");
const error_1 = require("../../utils/error");
const createDepartment = async (input) => {
    if (!input.name || !input.name.trim()) {
        throw new error_1.BadRequestError("Department name is required.");
    }
    const existing = await database_1.prisma.department.findFirst({
        where: {
            name: {
                equals: input.name.trim(),
                mode: "insensitive",
            },
        },
    });
    if (existing) {
        throw new error_1.ConflictError("Department name already exists.");
    }
    return database_1.prisma.department.create({
        data: {
            name: input.name.trim(),
            isActive: true,
            createdBy: {
                connect: {
                    id: input.adminId,
                },
            },
        },
        include: {
            createdBy: {
                select: {
                    id: true,
                    firstName: true,
                    email: true,
                },
            },
        },
    });
};
exports.createDepartment = createDepartment;
const updateDepartment = async (id, input) => {
    const department = await database_1.prisma.department.findUnique({
        where: { id },
    });
    if (!department) {
        throw new error_1.NotFoundError("Target department reference missing.");
    }
    const duplicate = await database_1.prisma.department.findFirst({
        where: {
            name: {
                equals: input.name.trim(),
                mode: "insensitive",
            },
            NOT: {
                id,
            },
        },
    });
    if (duplicate) {
        throw new error_1.ConflictError("Department name already exists.");
    }
    return database_1.prisma.department.update({
        where: {
            id,
        },
        data: {
            name: input.name.trim(),
            updatedBy: {
                connect: {
                    id: input.adminId,
                },
            },
        },
    });
};
exports.updateDepartment = updateDepartment;
const setDepartmentStatus = async (id, setActive, adminId) => {
    const department = await database_1.prisma.department.findUnique({ where: { id } });
    if (!department) {
        throw new error_1.NotFoundError("Target department reference missing.");
    }
    return database_1.prisma.department.update({
        where: { id },
        data: {
            isActive: setActive,
            updatedBy: {
                connect: { id: adminId }
            }
        },
    });
};
exports.setDepartmentStatus = setDepartmentStatus;
const getAllDepartments = async () => {
    return database_1.prisma.department.findMany({
        orderBy: { createdAt: "desc" },
        include: {
            manager: { select: { id: true, firstName: true, email: true } },
            _count: {
                select: { divisions: true },
            },
        },
    });
};
exports.getAllDepartments = getAllDepartments;
const getDepartmentById = async (id) => {
    const department = await database_1.prisma.department.findUnique({
        where: { id },
        include: {
            manager: { select: { id: true, firstName: true, middleName: true, lastName: true, email: true } },
            createdBy: { select: { firstName: true, middleName: true, lastName: true } },
            updatedBy: { select: { firstName: true, middleName: true, lastName: true } },
            divisions: {
                select: { id: true, name: true, isActive: true },
            },
        },
    });
    if (!department)
        throw new error_1.NotFoundError("Target department reference could not be located.");
    return department;
};
exports.getDepartmentById = getDepartmentById;
