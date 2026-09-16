import Axios from "./axios";

export const PermissionApi = {
    getAll() {
        return Axios.get("/permissions/getAll");
    },

    getDefaultPermissionsForRole(role, managerType) {
        return Axios.get("/permissions/default-role-permission", {
            params: { role, managerType },
        });
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