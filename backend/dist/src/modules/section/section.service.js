"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSectionById = exports.getAllSections = exports.removeStaffFromSection = exports.assignStaffToSection = exports.setSectionStatus = exports.updateSection = exports.createSection = void 0;
const database_1 = require("../../config/database");
const error_1 = require("../../utils/error");
const createSection = async (input) => {
    if (!input.name || !input.name.trim()) {
        throw new error_1.BadRequestError("Section name cannot be left empty.");
    }
    const division = await database_1.prisma.division.findUnique({
        where: {
            id: input.divisionId,
        },
    });
    if (!division) {
        throw new error_1.NotFoundError("Parent division not found.");
    }
    if (!division.isActive) {
        throw new error_1.BadRequestError("Cannot add sections to an inactive division.");
    }
    // Prevent duplicate section names
    const duplicate = await database_1.prisma.section.findFirst({
        where: {
            name: {
                equals: input.name.trim(),
                mode: "insensitive",
            },
        },
    });
    if (duplicate) {
        throw new error_1.BadRequestError("Section name is already exists.");
    }
    return database_1.prisma.section.create({
        data: {
            name: input.name.trim(),
            divisionId: input.divisionId,
            isActive: true,
            createdBy: input.adminId,
        },
        include: {
            division: {
                select: {
                    id: true,
                    name: true,
                },
            },
        },
    });
};
exports.createSection = createSection;
const updateSection = async (id, input) => {
    const section = await database_1.prisma.section.findUnique({
        where: {
            id,
        },
    });
    if (!section) {
        throw new error_1.NotFoundError("Target section missing.");
    }
    const duplicate = await database_1.prisma.section.findFirst({
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
        throw new error_1.BadRequestError("Section name is already exist.");
    }
    return database_1.prisma.section.update({
        where: {
            id,
        },
        data: {
            name: input.name.trim(),
            updatedBy: input.adminId,
        },
    });
};
exports.updateSection = updateSection;
const setSectionStatus = async (id, setActive, adminId) => {
    const section = await database_1.prisma.section.findUnique({ where: { id } });
    if (!section)
        throw new error_1.NotFoundError("Target section missing.");
    return database_1.prisma.section.update({
        where: { id },
        data: {
            isActive: setActive,
            updatedBy: adminId,
        },
    });
};
exports.setSectionStatus = setSectionStatus;
const assignStaffToSection = async (sectionId, staffId) => {
    const section = await database_1.prisma.section.findUnique({ where: { id: sectionId } });
    if (!section)
        throw new error_1.NotFoundError("Target section team map missing.");
    const staff = await database_1.prisma.staff.findUnique({ where: { id: staffId } });
    if (!staff)
        throw new error_1.NotFoundError("Target staff record not found.");
    return database_1.prisma.section.update({
        where: { id: sectionId },
        data: {
            staff: {
                connect: { id: staffId },
            },
        },
    });
};
exports.assignStaffToSection = assignStaffToSection;
const removeStaffFromSection = async (sectionId, staffId) => {
    const section = await database_1.prisma.section.findUnique({ where: { id: sectionId } });
    if (!section)
        throw new error_1.NotFoundError("Target section team map missing.");
    return database_1.prisma.section.update({
        where: { id: sectionId },
        data: {
            staff: {
                disconnect: { id: staffId },
            },
        },
    });
};
exports.removeStaffFromSection = removeStaffFromSection;
const getAllSections = async () => {
    return database_1.prisma.section.findMany({
        orderBy: { createdAt: "desc" },
        include: {
            division: {
                select: {
                    id: true,
                    name: true,
                    department: { select: { id: true, name: true } },
                },
            },
            _count: {
                select: { staff: true },
            },
        },
    });
};
exports.getAllSections = getAllSections;
const getSectionById = async (id) => {
    const section = await database_1.prisma.section.findUnique({
        where: { id },
        include: {
            division: {
                select: {
                    id: true,
                    name: true,
                    department: { select: { id: true, name: true } },
                },
            },
            staff: {
                select: { id: true, firstName: true, email: true, isPSsupport: true },
            },
        },
    });
    if (!section)
        throw new error_1.NotFoundError("Target section record not found.");
    return section;
};
exports.getSectionById = getSectionById;
