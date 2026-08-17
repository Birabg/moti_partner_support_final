import Axios from "./axios";

export const directorApi = {
  getUsersOverview() {
    return Axios.get("/pro/report/user/all/metrics");
  },

  getOrganizationStructure() {
    return Promise.all([
      Axios.get("/pro/report/structures/departments"),
      Axios.get("/pro/report/structures/divisions"),
      Axios.get("/pro/report/structures/sections"),
    ]);
  },

  getCaseAnalytics() {
    return Axios.get("/pro/report/cases/metrics/all");
  },

  getDashboardSummary() {
    return Axios.get("/pro/report/cases/metrics/all");
  },

  getCaseDetail(caseId) {
    return Axios.get(`/pro/report/cases/casesdetail/${caseId}`);
  },

  getOrganizationSummary() {
    return Axios.get("/pro/report/cases/organdproduct/organization/summary");
  },

  // admin-style organization list exposed to directors via a safe endpoint
  getOrganizationListAdmin() {
    return Axios.get("/pro/report/organdproduct/organization/list");
  },

  getReportsOverview() {
    return Promise.all([
      Axios.get("/pro/report/cases/count"),
      Axios.get("/pro/report/organdproduct/organization/summary"),
    ]);
  },

  getProfile() {
    return Axios.get("/staff/analyze");
  },

  updateProfile(payload) {
    return Axios.patch("/user/own/updateProfile", payload);
  },
};
