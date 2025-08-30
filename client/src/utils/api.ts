import axios from "axios";

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/auth`,
});

export const googleAuth = (code: string, role: string) =>
  api.get(`/google?code=${code}&role=${role}`);
