"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Login = void 0;
const database_1 = require("../../config/database");
const bcrypt_1 = require("../../utils/bcrypt");
const jwt_1 = require("../../utils/jwt");
const crypto_1 = __importDefault(require("crypto"));
const Login = async (email, passwordPlain) => {
    const now = new Date();
    let user = null;
    let partyType = "STAFF";
    let calculatedManagerType = null;
    const staffUser = await database_1.prisma.staff.findUnique({
        where: { email },
        include: {
            managedDepartment: { select: { id: true } },
            managedDivision: { select: { id: true } },
            managedSection: { select: { id: true } },
            section: { select: { id: true } },
            staffPermissions: { select: { permission: { select: { code: true } } } },
        },
    });
    if (staffUser) {
        user = staffUser;
        partyType = "STAFF";
        if (staffUser.managedDepartment) {
            calculatedManagerType = "DEPARTMENT";
        }
        else if (staffUser.managedDivision) {
            calculatedManagerType = "DIVISION";
        }
        else if (staffUser.managedSection) {
            calculatedManagerType = "SECTION";
        }
    }
    else {
        const customerUser = await database_1.prisma.customer.findUnique({ where: { email } });
        if (customerUser) {
            user = customerUser;
            partyType = "CUSTOMER";
        }
    }
    const permissionCodes = staffUser
        ? staffUser.staffPermissions.map((sp) => sp.permission.code)
        : [];
    if (!user) {
        throw new Error("Invalid email or password");
    }
    if (user.lockedUntil && now < new Date(user.lockedUntil)) {
        const minutesLeft = Math.ceil((new Date(user.lockedUntil).getTime() - now.getTime()) / 60000);
        throw new Error(`Account is temporarily locked. Please try again in ${minutesLeft} minutes.`);
    }
    if (user.status !== "ACTIVE") {
        throw new Error("Authentication blocked. Your account is not active.");
    }
    const isPasswordValid = await bcrypt_1.BcryptUtils.compare(passwordPlain, user.passwordHash);
    if (!isPasswordValid) {
        const updatedCount = user.failedLoginCount + 1;
        let lockoutTime = null;
        if (updatedCount >= 5) {
            lockoutTime = new Date(now.getTime() + 15 * 60000);
        }
        const updateData = {
            failedLoginCount: updatedCount,
            lockedUntil: lockoutTime,
        };
        if (partyType === "STAFF") {
            await database_1.prisma.staff.update({ where: { id: user.id }, data: updateData });
        }
        else {
            await database_1.prisma.customer.update({
                where: { id: user.id },
                data: updateData,
            });
        }
        if (updatedCount >= 5) {
            throw new Error("Account has been temporarily locked due to 5 failed login attempts.");
        }
        throw new Error("Invalid email or password");
    }
    if (user.failedLoginCount > 0 || user.lockedUntil) {
        const clearLockData = { failedLoginCount: 0, lockedUntil: null };
        if (partyType === "STAFF") {
            await database_1.prisma.staff.update({
                where: { id: user.id },
                data: clearLockData,
            });
        }
        else {
            await database_1.prisma.customer.update({
                where: { id: user.id },
                data: clearLockData,
            });
        }
    }
    const isStaff = partyType === "STAFF";
    const accessToken = jwt_1.JwtUtils.generateAccessToken({
        userId: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName || null,
        partyType,
        isSAdmin: isStaff ? user.isSAdmin : false,
        isManager: isStaff ? user.isManager : false,
        isDirector: isStaff ? user.isDirector : false,
        managerType: isStaff ? calculatedManagerType : null,
        isPSsupport: isStaff ? user.isPSsupport : false,
        departmentId: isStaff ? user.managedDepartment?.id || null : null,
        divisionId: isStaff ? user.managedDivision?.id || null : null,
        sectionId: isStaff ? user.section?.id || null : null,
        permissions: permissionCodes, // ADD THIS LINE — this is the field requirePermission actually reads
    });
    const refreshToken = jwt_1.JwtUtils.generateRefreshToken(user.id, partyType);
    const refreshTokenHash = crypto_1.default
        .createHash("sha256")
        .update(refreshToken)
        .digest("hex");
    await database_1.prisma.refreshToken.create({
        data: {
            userId: user.id,
            userType: partyType,
            tokenHash: refreshTokenHash,
            expiresAt: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
        },
    });
    return { accessToken, refreshToken, partyType };
};
exports.Login = Login;
