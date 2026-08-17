"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccountLockoutGuard = void 0;
const database_1 = require("../config/database");
const AccountLockoutGuard = async (req, res, next) => {
    const { email } = req.body;
    if (!email) {
        res.status(400).json({ error: "Email is required" });
        return;
    }
    try {
        const now = new Date();
        let userLockoutData = null;
        const staff = await database_1.prisma.staff.findUnique({
            where: { email },
            select: { failedLoginCount: true, lockedUntil: true },
        });
        if (staff) {
            userLockoutData = staff;
        }
        else {
            const customer = await database_1.prisma.customer.findUnique({
                where: { email },
                select: { failedLoginCount: true, lockedUntil: true },
            });
            if (customer)
                userLockoutData = customer;
        }
        if (userLockoutData && userLockoutData.lockedUntil) {
            if (now < userLockoutData.lockedUntil) {
                const minutesLeft = Math.ceil((userLockoutData.lockedUntil.getTime() - now.getTime()) / 60000);
                res.status(423).json({
                    error: `Account is temporarily locked out due to 5 failed login attempts. Please try again in ${minutesLeft} minutes.`,
                });
                return;
            }
        }
        next();
    }
    catch (error) {
        res.status(500).json({ error: "Internal server safety check failed" });
    }
};
exports.AccountLockoutGuard = AccountLockoutGuard;
