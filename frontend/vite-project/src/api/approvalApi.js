import Axios from "./axios";

export const ApprovalApi = {
  getPending() {
    return Axios.get("/pro/admin/approval/getPending");
  },

  getApproved() {
    return Axios.get("/pro/user/all/metrics");
  },

  approve(data) {
    return Axios.post("/pro/admin/approval/approve", data);
  },

  reject(userId, userType) {
    return Axios.post("/pro/admin/approval/reject", {
      userId,
      userType,
    });
  },
  deactivate(userId, userType) {
    return Axios.patch("/pro/admin/approval/deactivate", { userId, userType });
  },

  reactivate(userId, userType) {
    return Axios.patch("/pro/admin/approval/reactivate", { userId, userType });
  },
};