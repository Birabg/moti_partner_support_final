import axios from "axios";

const Axios = axios.create({
  baseURL: "http://localhost:5000/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

Axios.interceptors.request.use((config) => {
  try {
    const token = localStorage.getItem("jwt_token");

    if (token) {
      // ensure we do not accidentally overwrite other headers
      config.headers = config.headers || {};
      config.headers.Authorization = 'Bearer ' + token;
    }
  } catch (e) {
    // localStorage may be unavailable in some environments
    // fail silently and allow requests to continue without auth header
  }

  return config;
});

Axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      try { localStorage.removeItem("jwt_token"); } catch (_) {}
    }

    return Promise.reject(error);
  }
);

export default Axios;
