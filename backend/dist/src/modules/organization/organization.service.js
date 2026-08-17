"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reactivateOrganization = exports.deactivateOrganization = exports.updateOrganization = exports.getOrganizationById = exports.getAllOrganizations = exports.createOrganization = void 0;
const database_1 = require("../../config/database");
const error_1 = require("../../utils/error");
const createOrganization = async (input) => {
    if (!input.name || !input.emailDomain) {
        throw new error_1.BadRequestError("Both organization name and official email domain are required.");
    }
    const normalizedDomain = input.emailDomain.toLowerCase();
    const nameTaken = await database_1.prisma.organization.findUnique({
        where: { name: input.name },
    });
    if (nameTaken) {
        throw new error_1.ConflictError("An organization with this name already exists.");
    }
    const domainTaken = await database_1.prisma.emailDomain.findUnique({
        where: { domain: normalizedDomain },
    });
    if (domainTaken) {
        throw new error_1.ConflictError("This email domain is already registered to another tenant.");
    }
    return database_1.prisma.organization.create({
        data: {
            name: input.name,
            isActive: true,
            emailDomains: {
                create: {
                    domain: normalizedDomain,
                    isPrimary: true,
                    isActive: true,
                },
            },
        },
        include: {
            emailDomains: true,
        },
    });
};
exports.createOrganization = createOrganization;
const getAllOrganizations = async () => {
    return database_1.prisma.organization.findMany({
        orderBy: { createdAt: "desc" },
        include: {
            emailDomains: true,
            _count: {
                select: {
                    customers: true,
                },
            },
        },
    });
};
exports.getAllOrganizations = getAllOrganizations;
const getOrganizationById = async (id) => {
    const organization = await database_1.prisma.organization.findUnique({
        where: { id },
        include: {
            emailDomains: true,
            customers: {
                select: { id: true, firstName: true, email: true, status: true },
            },
        },
    });
    if (!organization) {
        throw new error_1.NotFoundError("Requested organization workspace could not be located.");
    }
    return organization;
};
exports.getOrganizationById = getOrganizationById;
const updateOrganization = async (id, input) => {
    const existing = await database_1.prisma.organization.findUnique({
        where: { id },
        include: { emailDomains: true }
    });
    if (!existing)
        throw new error_1.NotFoundError("Organization not found");
    if (input.name && input.name !== existing.name) {
        const nameTaken = await database_1.prisma.organization.findUnique({
            where: { name: input.name },
        });
        if (nameTaken) {
            throw new error_1.ConflictError("An organization with this name already exists");
        }
    }
    let domainUpdateOperations = {};
    if (input.emailDomain) {
        const normalizedDomain = input.emailDomain.toLowerCase();
        const domainTaken = await database_1.prisma.emailDomain.findUnique({
            where: { domain: normalizedDomain },
        });
        if (domainTaken) {
            if (domainTaken.organizationId !== id) {
                throw new error_1.ConflictError("This email domain is already allocated elsewhere.");
            }
        }
        else {
            const primaryDomain = existing.emailDomains.find(d => d.isPrimary);
            if (primaryDomain) {
                domainUpdateOperations = {
                    emailDomains: {
                        update: {
                            where: { id: primaryDomain.id },
                            data: { domain: normalizedDomain },
                        },
                    },
                };
            }
            else {
                domainUpdateOperations = {
                    emailDomains: {
                        create: {
                            domain: normalizedDomain,
                            isPrimary: true,
                            isActive: true,
                        },
                    },
                };
            }
        }
    }
    return database_1.prisma.organization.update({
        where: { id },
        data: {
            name: input.name,
            ...domainUpdateOperations,
        },
        include: {
            emailDomains: true,
        },
    });
};
exports.updateOrganization = updateOrganization;
const deactivateOrganization = async (id) => {
    const existing = await database_1.prisma.organization.findUnique({ where: { id } });
    if (!existing)
        throw new error_1.NotFoundError("Organization target missing.");
    return database_1.prisma.organization.update({
        where: { id },
        data: { isActive: false },
    });
};
exports.deactivateOrganization = deactivateOrganization;
const reactivateOrganization = async (id) => {
    const existing = await database_1.prisma.organization.findUnique({ where: { id } });
    if (!existing)
        throw new error_1.NotFoundError("Organization target missing.");
    return database_1.prisma.organization.update({
        where: { id },
        data: { isActive: true },
    });
};
exports.reactivateOrganization = reactivateOrganization;
