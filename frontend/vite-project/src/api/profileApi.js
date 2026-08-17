import api from "./axios";

export const ProfileApi = {
    me: () => api.get("/profile/me"),
    updateProfile: (data) => api.patch("/user/own/updateProfile", data),
};