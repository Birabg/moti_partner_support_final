import Axios from "./axios";

export const AnalyticsApi = {
  getCustomerAnalytics() {
    return Axios.get("/pro/user/analytics/customers/caseload-performance");
  },
  getAgentAnalytics() {
    return Axios.get("/pro/user/analytics/agent/performance-matrix");
  },

  getCaseSummary() {
    return Axios.get("/pro/report/cases/count");
  },
  getOrganizationSummary() {
    return Axios.get("/pro/report/organdproduct/organization/summary");
  },
};
