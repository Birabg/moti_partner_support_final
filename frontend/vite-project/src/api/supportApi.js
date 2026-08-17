import Axios from "./axios";

const SupportApi = {
  getDashboard() {
    return Axios.get("/staff/analyze");
  },

  getAssignedCases(page = 1, limit = 20) {
    return Axios.get("/staff/analyze").then((res) => {
      const activeWorkloadList = res?.data?.data?.activeWorkloadList || [];
      return {
        ...res,
        data: {
          ...res.data,
          data: activeWorkloadList,
        },
      };
    });
  },

  getHistory() {
    return Axios.get("/staff/analyze").then((res) => {
      const payload = res?.data?.data || {};
      const activeWorkloadList = payload.activeWorkloadList || [];
      const historicalClosedList = payload.historicalClosedList || [];
      const cases = [
        ...activeWorkloadList,
        ...historicalClosedList.map((item) => ({ ...item, status: "CLOSED" })),
      ];

      return {
        ...res,
        data: {
          ...res.data,
          data: cases,
        },
      };
    });
  },

  getCase(caseId) {
    return Axios.get(`/cases/${caseId}`);
  },

  resolveCase(caseId, payload) {
    return Axios.patch(`/cases/${caseId}/resolve`, payload);
  },

  getFeedbackAnalytics() {
    return Axios.get("/staff/feedback/analytics");
  },

  updateProfile(payload) {
    return Axios.patch("/user/own/updateProfile", payload);
  },
};

export const supportApi = SupportApi;
export default SupportApi;
