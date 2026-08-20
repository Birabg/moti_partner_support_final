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
    // Support both legacy `resolution` field from UI and new `resolutionSummary` expected by backend
    const body = { ...(payload || {}) };
    if (!body.resolutionSummary && body.resolution) {
      body.resolutionSummary = body.resolution;
      delete body.resolution;
    }
    return Axios.patch(`/cases/${caseId}/resolve`, body);
  },


  getFeedbackAnalytics(staffId) {
    const url = staffId ? `/staff/feedback/analytics?staffId=${encodeURIComponent(staffId)}` : "/staff/feedback/analytics";
    return Axios.get(url);
  },

  updateProfile(payload) {
    return Axios.patch("/user/own/updateProfile", payload);
  },
};

export const supportApi = SupportApi;
export default SupportApi;
