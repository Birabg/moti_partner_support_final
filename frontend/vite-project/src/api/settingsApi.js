import api from "./axios";

export const SettingsApi = {

    profile: () =>
        api.get("/settings/profile"),

    updateProfile: (data) =>
        api.patch("/settings/profile", data),

    changePassword: (data) =>
        api.patch("/settings/password", data),

    systemInfo: () =>
        api.get("/settings/system"),

    logoutAll: () =>
        api.post("/settings/logout-all"),

    deactivate: () =>
        api.patch("/settings/deactivate"),

};