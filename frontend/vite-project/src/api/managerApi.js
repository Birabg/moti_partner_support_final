import Axios from "./axios";

export const managerApi = {
  async getScopeOverview() {
    const token = localStorage.getItem("jwt_token");
    const decoded = token ? JSON.parse(atob(token.split(".")[1])) : {};
    const managerType = decoded.managerType || "SECTION";
    const scopeKey = {
      DEPARTMENT: "departmentId",
      DIVISION: "divisionId",
      SECTION: "sectionId",
    }[managerType] || "sectionId";

    const scopeId = decoded[scopeKey];
    if (!scopeId) {
      throw new Error("Manager scope is missing from the current session.");
    }

    const resource = {
      DEPARTMENT: "department",
      DIVISION: "division",
      SECTION: "section",
    }[managerType] || "section";

    const response = await Axios.get(`/manager/${scopeId}/${resource}`);
    const rawData = response?.data?.data || {};
    const normalized = normalizeManagerScopeData(rawData);
    return {
      ...response,
      data: {
        ...response.data,
        data: normalized,
      },
    };
  },

  async getMetrics() {
    return Axios.get("/pro/report/user/staff/metrics");
  },

  async getProfile() {
    return Axios.get("/staff/analyze");
  },

  async updateProfile(payload) {
    return Axios.patch("/user/own/updateProfile", payload);
  },
};

export default managerApi;

function normalizeManagerScopeData(rawData) {
  const caseMetrics = {
    ...(rawData.caseMetrics || {}),
  };

  if (!Array.isArray(caseMetrics.cases)) {
    caseMetrics.cases = Array.isArray(caseMetrics.recentCases) ? caseMetrics.recentCases : [];
  }

  const hierarchyMetrics = {
    ...(rawData.hierarchyMetrics || {}),
  };

  if (!Array.isArray(hierarchyMetrics.staffMembers)) {
    hierarchyMetrics.staffMembers = flattenManagerScopeStaff(hierarchyMetrics);
  }

  return {
    ...rawData,
    caseMetrics,
    hierarchyMetrics,
  };
}

function flattenManagerScopeStaff(hierarchyMetrics) {
  const staff = [];

  if (Array.isArray(hierarchyMetrics.staffMembers)) {
    return hierarchyMetrics.staffMembers;
  }

  if (Array.isArray(hierarchyMetrics.sections)) {
    hierarchyMetrics.sections.forEach((section) => {
      if (Array.isArray(section.staffMembers)) {
        staff.push(...section.staffMembers);
      }
    });
  }

  if (Array.isArray(hierarchyMetrics.divisions)) {
    hierarchyMetrics.divisions.forEach((division) => {
      if (Array.isArray(division.staffMembers)) {
        staff.push(...division.staffMembers);
      }
      if (Array.isArray(division.sections)) {
        division.sections.forEach((section) => {
          if (Array.isArray(section.staffMembers)) {
            staff.push(...section.staffMembers);
          }
        });
      }
    });
  }

  return staff;
}
