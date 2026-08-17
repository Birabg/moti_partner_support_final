import { Request, Response, NextFunction } from "express";
import { Login } from "./auth.service";
import { NotificationService } from "../notifications/notification.service";
import { prisma } from "../../config/database"
import crypto from "crypto";
import bcrypt from "bcrypt";
import { sendPasswordResetEmail } from "../../utils/email";
import { PartyType, NotificationType, TokenType } from "../../../generated/prisma/client";

const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: "Email and password are required" });
    return;
  }

  try {
    const { accessToken, refreshToken, partyType } = await Login(
      email,
      password,
    );

    res.cookie("refreshToken", refreshToken, REFRESH_COOKIE_OPTIONS);

    res.status(200).json({
      message: "Authentication successful",
      accessToken,
      partyType,
    });
  } catch (error: any) {
    res.status(401).json({ error: error.message || "Authentication failed" });
  }
};

export const requestSigninHelp = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({ error: "Email is required." });
      return;
    }

    const normalizedEmail = email.toLowerCase().trim();

    const [staffUser, customerUser, systemAdmins] = await Promise.all([
      prisma.staff.findUnique({ where: { email: normalizedEmail }, select: { id: true } }),
      prisma.customer.findUnique({ where: { email: normalizedEmail }, select: { id: true } }),
      prisma.staff.findMany({ where: { isSAdmin: true, status: "ACTIVE" }, select: { id: true } }),
    ]);

    const userType = staffUser ? "STAFF" : customerUser ? "CUSTOMER" : "UNKNOWN";
    const message = `Sign-in help requested for ${
      userType === "UNKNOWN" ? "an unknown account" : `${userType.toLowerCase()} account`
    } (${normalizedEmail}). Please follow up with the user.`;

    const recipientIds = systemAdmins.map((admin) => admin.id);

    if (recipientIds.length === 0) {
      res.status(500).json({ error: "No system administrators are available to receive this request." });
      return;
    }

    await NotificationService.createSystemNotification({
      recipientIds,
      recipientType: PartyType.STAFF,
      type: NotificationType.SIGNIN_HELP_REQUEST,
      message,
    });

    res.status(200).json({ message: "Help request sent to system administrators." });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ error: error.message || "Failed to send sign-in help request." });
  }
};

export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ error: "An unexpected error occurred during logout" });
  }
};




export const forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, userType = "STAFF" } = req.body; 

    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required." });
    }

    const normalizedEmail = email.toLowerCase().trim();

    let user: { id: string; firstName: string; middleName: string; lastName: string | null; email: string } | null = null;

    if (userType === "STAFF") {
      user = await prisma.staff.findUnique({ where: { email: normalizedEmail } });
    } else {
      user = await prisma.customer.findUnique({ where: { email: normalizedEmail } });
    }

    if (!user) {
      return res.status(200).json({
        success: true,
        message: "If an account with that email exists, a password reset link has been sent.",
      });
    }

    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); 

    await prisma.authToken.create({
      data: {
        userId: user.id,
        userType: userType as PartyType,
        tokenType: TokenType.PASSWORD_RESET,
        tokenHash: tokenHash,
        expiresAt: expiresAt,
      },
    });

    const fullName = `${user.firstName} ${user.middleName || ""} ${user.lastName || ""}`.trim();
    const emailSent = await sendPasswordResetEmail(user.email, fullName, rawToken, userType);

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
  } catch (error) {
    next(error);
  }
};


export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
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

    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    const resetTokenRecord = await prisma.authToken.findFirst({
      where: {
        tokenHash: tokenHash,
        tokenType: TokenType.PASSWORD_RESET,
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

    const passwordHash = await bcrypt.hash(newPassword, 10);

    await prisma.$transaction(async (tx) => {
      if (resetTokenRecord.userType === "STAFF") {
        await tx.staff.update({
          where: { id: resetTokenRecord.userId },
          data: {
            passwordHash: passwordHash,
            failedLoginCount: 0,
            lockedUntil: null,
          },
        });
      } else {
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
  } catch (error) {
    next(error);
  }
};
