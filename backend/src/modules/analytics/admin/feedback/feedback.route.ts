import { Router } from "express";
import { getCaseFeedbackAnalytics } from "./feedback.controller";

const router = Router();

router.get("/cases/feedback-metrics", getCaseFeedbackAnalytics);

export const FeedbackAnalyticsRouter = router;