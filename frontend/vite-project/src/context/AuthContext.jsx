import { createContext, useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { AuthApi } from "../api/authApi";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadUser();
    }, []);

    function loadUser() {
        try {
            const token = localStorage.getItem("jwt_token");

            if (!token) {
                setUser(null);
                setLoading(false);
                return;
            }

            const decoded = jwtDecode(token);
            const normalizedUser = {
                ...decoded,
                id: decoded.id || decoded.userId,
                partyType: decoded.partyType || (decoded.isSAdmin || decoded.isManager || decoded.isPSsupport || decoded.isDirector ? "STAFF" : "CUSTOMER"),
                firstName: decoded.firstName || "",
                lastName: decoded.lastName || "",
                email: decoded.email || "",
            };

            setUser(normalizedUser);
        } catch (error) {
            console.error(error);
            localStorage.removeItem("jwt_token");
            setUser(null);
        }

        setLoading(false);
    }

    async function login(credentials) {
        const decoded = await AuthApi.login(credentials);
        const normalizedUser = {
            ...decoded,
            id: decoded.id || decoded.userId,
            partyType: decoded.partyType || (decoded.isSAdmin || decoded.isManager || decoded.isPSsupport || decoded.isDirector ? "STAFF" : "CUSTOMER"),
            firstName: decoded.firstName || decoded.email?.split("@")[0] || "User",
            lastName: decoded.lastName || "",
            email: decoded.email || "",
        };

        setUser(normalizedUser);
        return normalizedUser;
    }

    async function logout() {
        await AuthApi.logout();
        setUser(null);
    }

    const value = {
        user,
        loading,
        login,
        logout,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}