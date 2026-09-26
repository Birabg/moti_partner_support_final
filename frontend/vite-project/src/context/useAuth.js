import { useContext } from "react";
import { AuthContext } from "./AuthContext";
import { usePermissions as usePermissionCheck } from "../lib/permissionCheck";

export function useAuth() {
    const context = useContext(AuthContext);
    const permissionCheck = usePermissionCheck(context?.user);
    
    return {
        ...context,
        ...permissionCheck,
    };
}