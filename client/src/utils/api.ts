import axios from "axios";

export const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}`,
});
// In your api.ts, add interceptor:
api.interceptors.request.use((config) => {
  const userInfo = localStorage.getItem("user-info");
  if (userInfo) {
    const { token } = JSON.parse(userInfo);
    config.headers.authorization = `Bearer ${token}`;
  }
  return config;
});

export const googleAuth = (code: string) =>
  api.get(`/auth/google?code=${code}`);
