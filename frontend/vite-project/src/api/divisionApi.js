import axios from "./axios";

export const DivisionApi = {
  getAll() {
    return axios.get("/pro/division/getAll");
  },

  getById(id) {
    return axios.get(`/pro/division/get/${id}`);
  },

  create(data) {
    return axios.post("/pro/division/create", data);
  },

  update(id, data) {
    return axios.patch(`/pro/division/update/${id}`, data);
  },

  deactivate(id) {
    return axios.patch(`/pro/division/${id}/deactivate`);
  },

  reactivate(id) {
    return axios.patch(`/pro/division/${id}/reactivate`);
  },
};