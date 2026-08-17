import { Request, Response, NextFunction } from "express";
import { prisma } from "../config/database";

export const AccountLockoutGuard = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const { email } = req.body;

  if (!email) {
    res.status(400).json({ error: "Email is required" });
    return;
  }

  try {
    const now = new Date();
    let userLockoutData = null;

    const staff = await prisma.staff.findUnique({
      where: { email },
      select: { failedLoginCount: true, lockedUntil: true },
    });

    if (staff) {
      userLockoutData = staff;
    } else {
      const customer = await prisma.customer.findUnique({
        where: { email },
        select: { failedLoginCount: true, lockedUntil: true },
      });
      if (customer) userLockoutData = customer;
    }

    if (userLockoutData && userLockoutData.lockedUntil) {
      if (now < userLockoutData.lockedUntil) {
        const minutesLeft = Math.ceil(
          (userLockoutData.lockedUntil.getTime() - now.getTime()) / 60000,
        );

        res.status(423).json({
          error: `Account is temporarily locked out due to 5 failed login attempts. Please try again in ${minutesLeft} minutes.`,
        });
        return;
      }
    }

    next();
  } catch (error) {
    res.status(500).json({ error: "Internal server safety check failed" });
  }
};
