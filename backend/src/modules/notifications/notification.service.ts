// src/services/notification.service.ts
import { prisma } from "../../config/database";
import { PartyType, NotificationType } from "../../../generated/prisma/client";

export class NotificationService {
  static async createSystemNotification(input: {
    recipientIds: string[];
    recipientType: PartyType;
    type: NotificationType;
    message: string;
    caseReportId?: string;
  }) {
    if (input.recipientIds.length === 0) return;

    const data = input.recipientIds.map((id) => ({
      recipientId: id,
      recipientType: input.recipientType,
      type: input.type,
      message: input.message,
      caseReportId: input.caseReportId,
      isRead: false,
    }));

    return await prisma.notification.createMany({
      data,
      skipDuplicates: true,
    });
  }

  static async getUserNotifications(recipientId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where: { recipientId },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: { caseReport: true },
      }),
      prisma.notification.count({ where: { recipientId } }),
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

  static async markAsRead(notificationId: string, recipientId?: string) {
    const where: any = { id: notificationId };
    if (recipientId) where.recipientId = recipientId;

    return await prisma.notification.updateMany({
      where,
      data: { isRead: true },
    });
  }
}
