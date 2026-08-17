"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
// src/services/notification.service.ts
const database_1 = require("../../config/database");
class NotificationService {
    static async createSystemNotification(input) {
        if (input.recipientIds.length === 0)
            return;
        const data = input.recipientIds.map((id) => ({
            recipientId: id,
            recipientType: input.recipientType,
            type: input.type,
            message: input.message,
            caseReportId: input.caseReportId,
            isRead: false,
        }));
        return await database_1.prisma.notification.createMany({
            data,
            skipDuplicates: true,
        });
    }
    static async getUserNotifications(recipientId, page = 1, limit = 20) {
        const skip = (page - 1) * limit;
        const [notifications, total] = await Promise.all([
            database_1.prisma.notification.findMany({
                where: { recipientId },
                orderBy: { createdAt: "desc" },
                skip,
                take: limit,
                include: { caseReport: true },
            }),
            database_1.prisma.notification.count({ where: { recipientId } }),
        ]);
        return {
            notifications,
            meta: {
                total,
                page,
                pages: Math.ceil(total / limit),
            },
        };
    }
    static async markAsRead(notificationId, recipientId) {
        const where = { id: notificationId };
        if (recipientId)
            where.recipientId = recipientId;
        return await database_1.prisma.notification.updateMany({
            where,
            data: { isRead: true },
        });
    }
}
exports.NotificationService = NotificationService;
