import Axios from "./axios";

export const DashboardApi = {
    me() {
        return Axios.get("/auth/me");
    },

    organizations() {
        return Axios.get("/organization/getAll");
    },

    pendingApprovals() {
        return Axios.get("/approval/getPending");
    },

    recentRequests() {
        return Axios.get("/request/getAll");
    },
};