import Axios from "./axios";
import { jwtDecode } from "jwt-decode";

export const AuthApi = {
  async login(credentials) {
    const res = await Axios.post(
      "/auth/login",
      credentials
    );

    localStorage.setItem(
      "jwt_token",
      res.data.accessToken
    );

    return jwtDecode(
      res.data.accessToken
    );
  },

  async signinHelp(data) {
    return Axios.post(
      "/auth/signin-help",
      data
    );
  },

  async logout() {
    await Axios.post("/auth/logout");

    localStorage.removeItem(
      "jwt_token"
    );
  },
};