import api from "./axios";

export const FeedbackApi = {
    getAnalytics() {
        return api.get("/cases/feedback-metrics");
    },
};