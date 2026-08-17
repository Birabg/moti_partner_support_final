import { Request, Response } from "express";
import { NotificationService } from "./notification.service";

export const getMyNotifications = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const userId = (req as any).user?.userId;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const data = await NotificationService.getUserNotifications(
      userId,
      page,
      limit,
    );

    res.status(200).json({ message: "Notifications retrieved.", data });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

export const markNotificationRead = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.userId;
    const notificationId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    if (!notificationId) {
      res.status(400).json({ message: "Notification id is required." });
      return;
    }

    await NotificationService.markAsRead(notificationId, userId);

    res.status(200).json({ message: "Notification marked as read." });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};
