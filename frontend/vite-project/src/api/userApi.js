import Axios from "./axios";

export const UserApi = {
    getAllApproved() {
        return Axios.get("/user/all-approved");
    },

    getById(id) {
        return Axios.get(`/user/${id}`);
    },

    update(id, data) {
        return Axios.put(`/user/${id}`, data);
    },

    getPermissions(id) {
        return Axios.get(`/user/${id}/permissions`);
    },

    updateEmail(id, email, reason) {
        return Axios.patch(`/user/update/${id}`, {
            email,
            reason,
        });
    },
};