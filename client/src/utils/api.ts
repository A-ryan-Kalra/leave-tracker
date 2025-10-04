import axios from "axios";

export const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}`,
  withCredentials: true,
});
// In your api.ts, add interceptor:
api.interceptors.request.use((config) => {
  const userInfo = localStorage.getItem("user-info");
  console.log("userInfo", userInfo);
  if (userInfo) {
    const { token } = JSON.parse(userInfo);
    console.log("token", token);
    config.headers.authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  //Error status: 2xx → just pass it through
  (res) => {
    console.log("rss", res);
    return res;
  },
  //Error status: 4xx/5xx → land here
  async function (err) {
    const orig = err.config;
    console.log("orig: ", orig._retry);
    if (err.response.status === 401 && !orig._retry) {
      orig._retry = true;
      console.log("  orig._retry = true;", (orig._retry = true));
      try {
        const { data } = await api.post("/auth/refresh", {});
        localStorage.setItem(
          "user-info",
          JSON.stringify({ token: data.token })
        );

        return api(orig);
      } catch (refreshError) {
        localStorage.removeItem("user-info");
        window.location.href = "/";
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(err);
  }
);

export const googleAuth = (code: string) =>
  api.get(`/auth/google?code=${code}`);
