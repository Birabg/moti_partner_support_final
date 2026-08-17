"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDivisionById = exports.getAllDivisions = exports.setDivisionStatus = exports.updateDivision = exports.createDivision = void 0;
const database_1 = require("../../config/database");
const error_1 = require("../../utils/error");
const createDivision = async (input) => {
    if (!input.name || !input.name.trim()) {
        throw new error_1.BadRequestError("Division title cannot be empty.");
    }
    const department = await database_1.prisma.department.findUnique({
        where: {
            id: input.departmentId,
        },
    });
    if (!department) {
        throw new error_1.NotFoundError("Parent department not found.");
    }
    if (!department.isActive) {
        throw new error_1.BadRequestError("Cannot add divisions to an inactive department.");
    }
    // Check duplicate division name (case-insensitive)
    const duplicate = await database_1.prisma.division.findFirst({
        where: {
            name: {
                equals: input.name.trim(),
                mode: "insensitive",
            },
        },
    });
    if (duplicate) {
        throw new error_1.ConflictError("Division name already exists.");
    }
    return database_1.prisma.division.create({
        data: {
            name: input.name.trim(),
            department: {
                connect: {
                    id: input.departmentId,
                },
            },
            isActive: true,
            createdBy: input.adminId,
        },
        include: {
            department: {
                select: {
                    id: true,
                    name: true,
                },
            },
        },
    });
};
exports.createDivision = createDivision;
const updateDivision = async (id, input) => {
    const division = await database_1.prisma.division.findUnique({
        where: {
            id,
        },
    });
    if (!division) {
        throw new error_1.NotFoundError("Target division missing.");
    }
    if (input.name) {
        const duplicate = await database_1.prisma.division.findFirst({
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
            throw new error_1.ConflictError("This name is already occupied.");
        }
    }
    return database_1.prisma.division.update({
        where: {
            id,
        },
        data: {
            ...(input.name && {
                name: input.name.trim(),
            }),
            updatedBy: input.adminId,
        },
    });
};
exports.updateDivision = updateDivision;
const setDivisionStatus = async (id, setActive, adminId) => {
    const division = await database_1.prisma.division.findUnique({ where: { id } });
    if (!division)
        throw new error_1.NotFoundError("Target division missing.");
    return database_1.prisma.division.update({
        where: { id },
        data: {
            isActive: setActive,
            updatedBy: adminId,
        },
    });
};
exports.setDivisionStatus = setDivisionStatus;
const getAllDivisions = async () => {
    return database_1.prisma.division.findMany({
        orderBy: { createdAt: "desc" },
        include: {
            department: { select: { id: true, name: true } },
            manager: { select: { id: true, firstName: true, email: true } },
            _count: {
                select: { sections: true },
            },
        },
    });
};
exports.getAllDivisions = getAllDivisions;
const getDivisionById = async (id) => {
    const divisionRecord = await database_1.prisma.division.findUnique({
        where: { id },
        include: {
            department: { select: { id: true, name: true } },
            manager: { select: { id: true, firstName: true, email: true } },
            sections: {
                select: { id: true, name: true, isActive: true },
            },
        },
    });
    if (!divisionRecord) {
        throw new error_1.NotFoundError("Target division record not found.");
    }
    return {
        id: divisionRecord.id,
        name: divisionRecord.name,
        isActive: divisionRecord.isActive,
        departmentId: divisionRecord.department?.id || null,
        departmentName: divisionRecord.department?.name || "Unassigned / Independent Tiers",
        manager: divisionRecord.manager
            ? {
                id: divisionRecord.manager.id,
                firstName: divisionRecord.manager.firstName,
                email: divisionRecord.manager.email,
            }
            : null,
        sections: divisionRecord.sections || [],
    };
};
exports.getDivisionById = getDivisionById;
