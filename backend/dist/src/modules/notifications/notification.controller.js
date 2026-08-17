"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.markNotificationRead = exports.getMyNotifications = void 0;
const notification_service_1 = require("./notification.service");
const getMyNotifications = async (req, res) => {
    try {
        const userId = req.user?.userId;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const data = await notification_service_1.NotificationService.getUserNotifications(userId, page, limit);
        res.status(200).json({ message: "Notifications retrieved.", data });
    }
    catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message });
    }
};
exports.getMyNotifications = getMyNotifications;
const markNotificationRead = async (req, res) => {
    try {
        const userId = req.user?.userId;
        const notificationId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        if (!notificationId) {
            res.status(400).json({ message: "Notification id is required." });
            return;
        }
        await notification_service_1.NotificationService.markAsRead(notificationId, userId);
        res.status(200).json({ message: "Notification marked as read." });
    }
    catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message });
    }
};
exports.markNotificationRead = markNotificationRead;
