"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resendStaffVerification = exports.verifyStaffEmail = exports.Register = void 0;
const database_1 = require("../../config/database");
const bcrypt_1 = require("../../utils/bcrypt");
const email_1 = require("../../utils/email");
const crypto_1 = __importDefault(require("crypto"));
// const ALLOWED_STAFF_DOMAIN = "motiengineering.com";
const Register = async (data) => {
    const emailExistsInStaff = await database_1.prisma.staff.findUnique({
        where: { email: data.email },
    });
    const emailExistsInCustomers = await database_1.prisma.customer.findUnique({
        where: { email: data.email },
    });
    if (emailExistsInStaff || emailExistsInCustomers) {
        throw new Error("An account with this email address already exists.");
    }
    const passwordHash = await bcrypt_1.BcryptUtils.hash(data.passwordPlain);
    // Database transaction commits user and token
    const txResult = await database_1.prisma.$transaction(async (tx) => {
        const newStaff = await tx.staff.create({
            data: {
                firstName: data.firstName,
                lastName: data.lastName,
                middleName: data.middleName,
                email: data.email,
                passwordHash,
                gender: data.gender,
                phoneNumber: data.phoneNumber,
                status: "PENDING_VERIFICATION",
            },
        });
        const selfReferencedStaff = await tx.staff.update({
            where: { id: newStaff.id },
            data: {
                createdById: newStaff.id,
                updatedById: newStaff.id,
            },
        });
        const rawToken = crypto_1.default.randomBytes(32).toString("hex");
        const tokenHash = crypto_1.default
            .createHash("sha256")
            .update(rawToken)
            .digest("hex");
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
        await tx.authToken.create({
            data: {
                userId: selfReferencedStaff.id,
                userType: "STAFF",
                tokenType: "EMAIL_VERIFICATION",
                tokenHash,
                expiresAt,
            },
        });
        const loggedEmail = await tx.emailLog.create({
            data: {
                recipientId: selfReferencedStaff.id,
                recipientEmail: selfReferencedStaff.email,
                emailType: "EMAIL_VERIFICATION",
                status: "PENDING",
            },
        });
        return {
            staffId: selfReferencedStaff.id,
            email: selfReferencedStaff.email,
            fullName: `${selfReferencedStaff.firstName} ${selfReferencedStaff.middleName} ${selfReferencedStaff.lastName ?? ""}`.trim(),
            emailLogId: loggedEmail.id,
            rawToken,
        };
    });
    // Attempt email delivery without breaking user creation if SMTP fails
    try {
        const deliverySuccess = await (0, email_1.sendVerificationEmail)(txResult.email, txResult.fullName, txResult.rawToken, "STAFF");
        await database_1.prisma.emailLog.update({
            where: { id: txResult.emailLogId },
            data: {
                status: deliverySuccess ? "SENT" : "FAILED",
                sentAt: deliverySuccess ? new Date() : null,
                retryCount: deliverySuccess ? 0 : 1,
            },
        });
    }
    catch (emailError) {
        console.error("Email delivery threw an exception:", emailError);
        await database_1.prisma.emailLog.update({
            where: { id: txResult.emailLogId },
            data: { status: "FAILED", retryCount: 1 },
        });
    }
    return { staffId: txResult.staffId };
};
exports.Register = Register;
const verifyStaffEmail = async (rawToken) => {
    const tokenHash = crypto_1.default.createHash("sha256").update(rawToken).digest("hex");
    const now = new Date();
    console.log("[verifyStaffEmail] called with rawToken:", rawToken);
    console.log("[verifyStaffEmail] computed tokenHash:", tokenHash);
    const result = await database_1.prisma.$transaction(async (tx) => {
        const tokenRecord = await tx.authToken.findFirst({
            where: {
                tokenHash,
                userType: "STAFF",
                tokenType: "EMAIL_VERIFICATION",
                usedAt: null,
            },
        });
        console.log("[verifyStaffEmail] tokenRecord found:", tokenRecord);
        if (!tokenRecord || now > tokenRecord.expiresAt) {
            console.log("[verifyStaffEmail] REJECTED — no valid unused token matched this hash");
            throw new Error("The email verification link is invalid or has expired.");
        }
        await tx.authToken.update({
            where: { id: tokenRecord.id },
            data: { usedAt: now },
        });
        const activatedStaff = await tx.staff.update({
            where: { id: tokenRecord.userId },
            data: { status: "PENDING_APPROVAL" },
        });
        console.log("[verifyStaffEmail] staff row updated:", {
            id: activatedStaff.id,
            email: activatedStaff.email,
            status: activatedStaff.status,
        });
        return { email: activatedStaff.email, status: activatedStaff.status };
    });
    const recheck = await database_1.prisma.staff.findUnique({
        where: { email: result.email },
    });
    console.log("[verifyStaffEmail] re-read from DB after commit:", recheck?.status);
    return result;
};
exports.verifyStaffEmail = verifyStaffEmail;
const resendStaffVerification = async (email) => {
    const staff = await database_1.prisma.staff.findUnique({ where: { email } });
    if (!staff || staff.status !== "PENDING_VERIFICATION") {
        return { email, dummyMode: true };
    }
    const rawToken = crypto_1.default.randomBytes(32).toString("hex");
    const tokenHash = crypto_1.default.createHash("sha256").update(rawToken).digest("hex");
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const txResult = await database_1.prisma.$transaction(async (tx) => {
        await tx.authToken.deleteMany({
            where: {
                userId: staff.id,
                tokenType: "EMAIL_VERIFICATION",
            },
        });
        const authToken = await tx.authToken.create({
            data: {
                userId: staff.id,
                userType: "STAFF",
                tokenType: "EMAIL_VERIFICATION",
                tokenHash,
                expiresAt,
            },
        });
        const loggedEmail = await tx.emailLog.create({
            data: {
                recipientId: staff.id,
                recipientEmail: staff.email,
                emailType: "EMAIL_VERIFICATION",
                status: "PENDING",
            },
        });
        return {
            emailLogId: loggedEmail.id,
            rawToken,
            email: staff.email,
            firstName: staff.firstName,
            lastName: staff.lastName,
            middleName: staff.middleName,
        };
    });
    const deliverySuccess = await (0, email_1.sendVerificationEmail)(txResult.email, [txResult.firstName, txResult.middleName, txResult.lastName].filter(Boolean).join(" ").trim(), txResult.rawToken, "STAFF");
    await database_1.prisma.emailLog.update({
        where: { id: txResult.emailLogId },
        data: {
            status: deliverySuccess ? "SENT" : "FAILED",
            sentAt: deliverySuccess ? new Date() : null,
        },
    });
    return { email: txResult.email };
};
exports.resendStaffVerification = resendStaffVerification;
