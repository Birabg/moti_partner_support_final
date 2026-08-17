import Axios from "./axios";

export const PermissionApi = {
    getAll() {
        return Axios.get("/permissions/getAll");
    },

    grant(targetStaffId, permissionCodes) {
        return Axios.patch("/permissions/grant", {
            targetStaffId,
            permissionCodes,
        });
    },

    revoke(targetStaffId, permissionCodes) {
        return Axios.patch("/permissions/revoke", {
            targetStaffId,
            permissionCodes,
        });
    },

    sync(targetStaffId, permissionCodes) {
        return Axios.put("/permissions/sync", {
            targetStaffId,
            permissionCodes,
        });
    },
};