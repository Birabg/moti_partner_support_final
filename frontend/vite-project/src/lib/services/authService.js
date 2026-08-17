import { AuthApi } from "../../api/authApi";

export const authService = {
  async login({ email, password }) {
    try {
      // Login
      const response = await AuthApi.login({
        email,
        password,
      });

      const { accessToken } = response.data;

      if (!accessToken) {
        throw new Error("No access token received from server.");
      }

      // Save JWT
      localStorage.setItem("jwt_token", accessToken);

      // Get logged-in user
      const me = await AuthApi.getProfile();

      return me.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.error ||
          error.response?.data?.message ||
          "Login failed."
      );
    }
  },

  async logout() {
    try {
      await AuthApi.logout();
    } finally {
      localStorage.removeItem("jwt_token");
    }
  },

  getCurrentUser() {
    const token = localStorage.getItem("jwt_token");

    if (!token) {
      return null;
    }

    // User information will be loaded again after login
    return {};
  },
};