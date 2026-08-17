import axios from "./axios";

export const SectionApi = {
  getAll() {
    return axios.get("/pro/section/getAll");
  },

  getById(id) {
    return axios.get(`/pro/section/get/${id}`);
  },

  create(data) {
    return axios.post("/pro/section/create", data);
  },

  update(id, data) {
    return axios.patch(`/pro/section/update/${id}`, data);
  },

  deactivate(id) {
    return axios.patch(`/pro/section/${id}/deactivate`);
  },

  reactivate(id) {
    return axios.patch(`/pro/section/${id}/reactivate`);
  },
};