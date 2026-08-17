import Axios from "./axios";

export const OrganizationApi = {
  getAll() {
    return Axios.get("/organization/getAll");
  },

  getById(id) {
    return Axios.get(`/organization/get/${id}`);
  },

  create(data) {
    return Axios.post("/organization/create", data);
  },

  update(id, data) {
    return Axios.patch(`/organization/update/${id}`, data);
  },

  deactivate(id) {
    return Axios.patch(`/organization/${id}/deactivate`);
  },

  reactivate(id) {
    return Axios.patch(`/organization/${id}/reactivate`);
  },
};