"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserPermissions = exports.updateUserByAdmin = exports.getUserById = exports.getAllApprovedUsers = exports.updateEmailByAdmin = exports.updateSelfProfile = exports.findAccountById = void 0;
const database_1 = require("../../config/database");
const bcrypt_1 = __importDefault(require("bcrypt"));
const error_1 = require("../../utils/error");
const findAccountById = async (accountId) => {
    const staff = await database_1.prisma.staff.findUnique({
        where: { id: accountId },
    });
    if (staff) {
        return {
            account: staff,
            type: "STAFF",
        };
    }
    const customer = await database_1.prisma.customer.findUnique({
        where: { id: accountId },
    });
    if (customer) {
        return {
            account: customer,
            type: "CUSTOMER",
        };
    }
    return null;
};
exports.findAccountById = findAccountById;
const updateSelfProfile = async (accountId, accountType, updates) => {
    if (updates.password) {
        updates.passwordHash =
            await bcrypt_1.default.hash(updates.password, 10);
        delete updates.password;
    }
    if (accountType === "STAFF") {
        return database_1.prisma.staff.update({
            where: { id: accountId },
            data: {
                ...updates,
                updatedById: accountId,
            },
        });
    }
    return database_1.prisma.customer.update({
        where: { id: accountId },
        data: {
            ...updates,
            updatedById: accountId,
            updatedByType: "CUSTOMER",
        },
    });
};
exports.updateSelfProfile = updateSelfProfile;
const updateEmailByAdmin = async (id, email, adminId, reason) => {
    const found = await (0, exports.findAccountById)(id);
    if (!found) {
        throw new error_1.NotFoundError("User not found.");
    }
    if (found.type === "STAFF") {
        return database_1.prisma.staff.update({
            where: { id },
            data: {
                email,
                emailChangeReason: reason,
                updatedById: adminId,
            },
        });
    }
    return database_1.prisma.customer.update({
        where: { id },
        data: {
            email,
            emailChangeReason: reason,
            updatedById: adminId,
            updatedByType: "STAFF",
        },
    });
};
exports.updateEmailByAdmin = updateEmailByAdmin;
const getAllApprovedUsers = async () => {
    const staff = await database_1.prisma.staff.findMany({
        where: {
            status: {
                in: [
                    "ACTIVE",
                    "DEACTIVATED",
                ],
            },
        },
        include: {
            staffPermissions: {
                include: {
                    permission: true,
                },
            },
        },
    });
    const customers = await database_1.prisma.customer.findMany({
        where: {
            status: {
                in: [
                    "ACTIVE",
                    "DEACTIVATED",
                ],
            },
        },
    });
    const formatFullName = (firstName, middleName, lastName) => [firstName, middleName, lastName].filter(Boolean).join(" ").trim();
    return [...staff.map((s) => ({
            ...s,
            type: "STAFF",
            fullName: formatFullName(s.firstName, s.middleName, s.lastName),
            permissions: s.staffPermissions.map((entry) => entry.permission),
        })), ...customers.map((c) => ({
            ...c,
            type: "CUSTOMER",
            fullName: formatFullName(c.firstName, c.middleName, c.lastName),
        }))].sort((a, b) => {
        const left = (a.fullName || `${a.firstName || ""} ${a.lastName || ""}`.trim()).toLowerCase();
        const right = (b.fullName || `${b.firstName || ""} ${b.lastName || ""}`.trim()).toLowerCase();
        return left.localeCompare(right);
    });
};
exports.getAllApprovedUsers = getAllApprovedUsers;
const getUserById = async (id) => {
    const staff = await database_1.prisma.staff.findUnique({
        where: { id },
        include: {
            section: {
                include: {
                    division: {
                        include: {
                            department: true,
                        },
                    },
                },
            },
            staffPermissions: {
                include: {
                    permission: true,
                },
            },
        },
    });
    if (staff) {
        return {
            ...staff,
            type: "STAFF",
        };
    }
    const customer = await database_1.prisma.customer.findUnique({
        where: { id },
        include: {
            organization: true,
        },
    });
    if (customer) {
        return {
            ...customer,
            type: "CUSTOMER",
        };
    }
    throw new error_1.NotFoundError("User not found.");
};
exports.getUserById = getUserById;
const updateUserByAdmin = async (id, data) => {
    const found = await (0, exports.findAccountById)(id);
    if (!found) {
        throw new error_1.NotFoundError("User not found.");
    }
    delete data.email;
    if (found.type === "STAFF") {
        const updateData = {
            firstName: data.firstName,
            middleName: data.middleName,
            lastName: data.lastName,
            phoneNumber: data.phoneNumber,
        };
        return database_1.prisma.staff.update({
            where: { id },
            data: updateData,
        });
    }
    const updateData = {
        firstName: data.firstName,
        middleName: data.middleName,
        lastName: data.lastName,
        phoneNumber: data.phoneNumber,
        position: data.position,
    };
    return database_1.prisma.customer.update({
        where: { id },
        data: updateData,
    });
};
exports.updateUserByAdmin = updateUserByAdmin;
const getUserPermissions = async (id) => {
    return database_1.prisma.staff.findUnique({
        where: { id },
        include: {
            staffPermissions: {
                include: {
                    permission: true,
                },
            },
        },
    });
};
exports.getUserPermissions = getUserPermissions;
