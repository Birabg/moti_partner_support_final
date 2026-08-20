import api from "./axios";

export const FeedbackApi = {
    getAnalytics() {
        // Admin analytics are mounted under /pro/report/feedback
        return api.get("/pro/report/feedback/cases/feedback-metrics");
    },
};