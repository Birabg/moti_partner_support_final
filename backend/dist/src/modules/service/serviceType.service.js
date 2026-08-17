"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getServiceTypeById = exports.getAllServiceTypes = exports.setServiceTypeActiveStatus = exports.updateServiceType = exports.createServiceType = void 0;
const database_1 = require("../../config/database");
const error_1 = require("../../utils/error");
const createServiceType = async (name) => {
    const existing = await database_1.prisma.serviceType.findUnique({ where: { name } });
    if (existing) {
        throw new error_1.BadRequestError(`A service type named '${name}' already exists.`);
    }
    return await database_1.prisma.serviceType.create({
        data: { name },
    });
};
exports.createServiceType = createServiceType;
const updateServiceType = async (id, name) => {
    const serviceType = await database_1.prisma.serviceType.findUnique({ where: { id } });
    if (!serviceType)
        throw new error_1.NotFoundError("Target service type not found.");
    if (name !== serviceType.name) {
        const existing = await database_1.prisma.serviceType.findUnique({ where: { name } });
        if (existing)
            throw new error_1.BadRequestError(`Service type name '${name}' is already taken.`);
    }
    return await database_1.prisma.serviceType.update({
        where: { id },
        data: { name },
    });
};
exports.updateServiceType = updateServiceType;
const setServiceTypeActiveStatus = async (id, isActive) => {
    const serviceType = await database_1.prisma.serviceType.findUnique({ where: { id } });
    if (!serviceType)
        throw new error_1.NotFoundError("Target service type not found.");
    return await database_1.prisma.serviceType.update({
        where: { id },
        data: { isActive },
    });
};
exports.setServiceTypeActiveStatus = setServiceTypeActiveStatus;
const getAllServiceTypes = async () => {
    return database_1.prisma.serviceType.findMany({
        where: {
            isActive: true
        },
        orderBy: {
            createdAt: "desc"
        }
    });
};
exports.getAllServiceTypes = getAllServiceTypes;
const getServiceTypeById = async (id) => {
    const serviceType = await database_1.prisma.serviceType.findUnique({
        where: { id },
        include: {
            _count: { select: { cases: true } },
        },
    });
    if (!serviceType)
        throw new error_1.NotFoundError("Service type record not found.");
    return serviceType;
};
exports.getServiceTypeById = getServiceTypeById;
