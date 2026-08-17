"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FeedbackAnalyticsRouter = void 0;
const express_1 = require("express");
const feedback_controller_1 = require("./feedback.controller");
const router = (0, express_1.Router)();
router.get("/cases/feedback-metrics", feedback_controller_1.getCaseFeedbackAnalytics);
exports.FeedbackAnalyticsRouter = router;
