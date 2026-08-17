import axios from "./axios";

export const DepartmentApi = {
  getAll() {
    return axios.get("/pro/department/getAll");
  },

  getById(id) {
    return axios.get(`/pro/department/${id}`);
  },

  create(data) {
    return axios.post("/pro/department", data);
  },

  update(id, data) {
    return axios.put(`/pro/department/${id}`, data);
  },

  deactivate(id) {
    return axios.patch(`/pro/department/${id}/deactivate`);
  },

  reactivate(id) {
    return axios.patch(`/pro/department/${id}/reactivate`);
  },
};