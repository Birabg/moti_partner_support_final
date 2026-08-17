import { Router } from "express";
import { getMyNotifications, markNotificationRead } from "./notification.controller";
import { authenticateToken } from "../../middleware/auth.middleware";

const router = Router();

router.use(authenticateToken);

router.get("/get", getMyNotifications);
router.patch("/read/:id", markNotificationRead);

export const NotificationRouter = router;
