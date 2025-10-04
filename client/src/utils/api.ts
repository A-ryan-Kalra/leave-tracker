import axios from "axios";

export const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}`,
  withCredentials: true,
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

api.interceptors.response.use(
  (res) => res,
  async function err(err) {
    const orig = err.config;
    if (err.response.status === 401 && !orig._retry) {
      orig._retry = true;
      const { data } = await api.post(
        "/refresh",
        {},
        { withCredentials: true }
      );
      localStorage.setItem("user-info", data.accessToken);
      return api(orig);
    }
    return Promise.reject(err);
  }
);

export const googleAuth = (code: string) =>
  api.get(`/auth/google?code=${code}`);
