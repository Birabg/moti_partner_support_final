import { Axios } from "../api/axios";

export const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

/**
 * Generic request helper using the shared Axios instance.
 */
export async function request(
  path,
  { method = "GET", body, headers = {} } = {}
) {
  const response = await Axios({
    url: path,
    method,
    data: body,
    headers,
  });

  return response.data;
}