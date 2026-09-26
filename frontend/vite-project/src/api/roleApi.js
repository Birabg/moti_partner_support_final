import Axios from "./axios";

export const RoleApi = {
  assignRole(data) {
    return Axios.patch("/pro/admin/role/update", data);
  },

  revokeRole(data) {
    return Axios.patch("/pro/admin/role/revoke", data);
  },
};