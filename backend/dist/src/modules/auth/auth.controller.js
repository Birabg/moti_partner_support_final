"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPassword = exports.forgotPassword = exports.logout = exports.requestSigninHelp = exports.login = void 0;
const auth_service_1 = require("./auth.service");
const notification_service_1 = require("../notifications/notification.service");
const database_1 = require("../../config/database");
const crypto_1 = __importDefault(require("crypto"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const email_1 = require("../../utils/email");
const client_1 = require("../../../generated/prisma/client");
const REFRESH_COOKIE_OPTIONS = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
};
const login = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        res.status(400).json({ error: "Email and password are required" });
        return;
    }
    try {
        const { accessToken, refreshToken, partyType } = await (0, auth_service_1.Login)(email, password);
        res.cookie("refreshToken", refreshToken, REFRESH_COOKIE_OPTIONS);
        res.status(200).json({
            message: "Authentication successful",
            accessToken,
            partyType,
        });
    }
    catch (error) {
        res.status(401).json({ error: error.message || "Authentication failed" });
    }
};
exports.login = login;
const requestSigninHelp = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            res.status(400).json({ error: "Email is required." });
            return;
        }
        const normalizedEmail = email.toLowerCase().trim();
        const [staffUser, customerUser, systemAdmins] = await Promise.all([
            database_1.prisma.staff.findUnique({ where: { email: normalizedEmail }, select: { id: true } }),
            database_1.prisma.customer.findUnique({ where: { email: normalizedEmail }, select: { id: true } }),
            database_1.prisma.staff.findMany({ where: { isSAdmin: true, status: "ACTIVE" }, select: { id: true } }),
        ]);
        const userType = staffUser ? "STAFF" : customerUser ? "CUSTOMER" : "UNKNOWN";
        const message = `Sign-in help requested for ${userType === "UNKNOWN" ? "an unknown account" : `${userType.toLowerCase()} account`} (${normalizedEmail}). Please follow up with the user.`;
        const recipientIds = systemAdmins.map((admin) => admin.id);
        if (recipientIds.length === 0) {
            res.status(500).json({ error: "No system administrators are available to receive this request." });
            return;
        }
        await notification_service_1.NotificationService.createSystemNotification({
            recipientIds,
            recipientType: client_1.PartyType.STAFF,
            type: client_1.NotificationType.SIGNIN_HELP_REQUEST,
            message,
        });
        res.status(200).json({ message: "Help request sent to system administrators." });
    }
    catch (error) {
        res.status(error.statusCode || 500).json({ error: error.message || "Failed to send sign-in help request." });
    }
};
exports.requestSigninHelp = requestSigninHelp;
const logout = async (req, res) => {
    try {
        res.clearCookie("refreshToken", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
        });
        res.status(200).json({ message: "Logged out successfully" });
    }
    catch (error) {
        res
            .status(500)
            .json({ error: "An unexpected error occurred during logout" });
    }
};
exports.logout = logout;
const forgotPassword = async (req, res, next) => {
    try {
        const { email, userType = "STAFF" } = req.body;
        if (!email) {
            return res.status(400).json({ success: false, message: "Email is required." });
        }
        const normalizedEmail = email.toLowerCase().trim();
        let user = null;
        if (userType === "STAFF") {
            user = await database_1.prisma.staff.findUnique({ where: { email: normalizedEmail } });
        }
        else {
            user = await database_1.prisma.customer.findUnique({ where: { email: normalizedEmail } });
        }
        if (!user) {
            return res.status(200).json({
                success: true,
                message: "If an account with that email exists, a password reset link has been sent.",
            });
        }
        const rawToken = crypto_1.default.randomBytes(32).toString("hex");
        const tokenHash = crypto_1.default.createHash("sha256").update(rawToken).digest("hex");
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
        await database_1.prisma.authToken.create({
            data: {
                userId: user.id,
                userType: userType,
                tokenType: client_1.TokenType.PASSWORD_RESET,
                tokenHash: tokenHash,
                expiresAt: expiresAt,
            },
        });
        const fullName = `${user.firstName} ${user.middleName || ""} ${user.lastName || ""}`.trim();
        const emailSent = await (0, email_1.sendPasswordResetEmail)(user.email, fullName, rawToken, userType);
        if (!emailSent) {
            return res.status(500).json({
                success: false,
                message: "Failed to send password reset email. Please try again later.",
            });
        }
        return res.status(200).json({
            success: true,
            message: "If an account with that email exists, a password reset link has been sent.",
        });
    }
    catch (error) {
        next(error);
    }
};
exports.forgotPassword = forgotPassword;
const resetPassword = async (req, res, next) => {
    try {
        const { token, newPassword } = req.body;
        if (!token || !newPassword) {
            return res.status(400).json({
                success: false,
                message: "Reset token and new password are required.",
            });
        }
        if (newPassword.length < 8) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 8 characters long.",
            });
        }
        const tokenHash = crypto_1.default.createHash("sha256").update(token).digest("hex");
        const resetTokenRecord = await database_1.prisma.authToken.findFirst({
            where: {
                tokenHash: tokenHash,
                tokenType: client_1.TokenType.PASSWORD_RESET,
                usedAt: null,
                expiresAt: { gt: new Date() },
            },
        });
        if (!resetTokenRecord) {
            return res.status(400).json({
                success: false,
                message: "Invalid, expired, or previously used password reset token.",
            });
        }
        const passwordHash = await bcrypt_1.default.hash(newPassword, 10);
        await database_1.prisma.$transaction(async (tx) => {
            if (resetTokenRecord.userType === "STAFF") {
                await tx.staff.update({
                    where: { id: resetTokenRecord.userId },
                    data: {
                        passwordHash: passwordHash,
                        failedLoginCount: 0,
                        lockedUntil: null,
                    },
                });
            }
            else {
                await tx.customer.update({
                    where: { id: resetTokenRecord.userId },
                    data: {
                        passwordHash: passwordHash,
                    },
                });
            }
            await tx.authToken.update({
                where: { id: resetTokenRecord.id },
                data: { usedAt: new Date() },
            });
        });
        return res.status(200).json({
            success: true,
            message: "Password reset successfully. You can now log in with your new password.",
        });
    }
    catch (error) {
        next(error);
    }
};
exports.resetPassword = resetPassword;
