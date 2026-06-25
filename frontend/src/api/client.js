import axios from "axios";
import { useAuthStore } from "@/store/auth";
import { toast } from "sonner";

// Usa caminho relativo "/api" por defeito, para passar pelo proxy do Vite
// (vite.config.js -> server.proxy["/api"] -> http://localhost:4000)
// Isto faz com que funcione tanto em localhost como em acesso pela rede
// (ex: http://192.168.6.121:4001), sem precisar de definir IPs fixos.
export const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "";
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  timeout: 20000,
});

const last = new Map();
api.interceptors.request.use((config) => {
  const k = (config.method || "get") + " " + (config.url || "");
  const now = Date.now();
  if (last.has(k) && now - last.get(k) < 250) {
    return Promise.reject(new axios.Cancel("Aguarde antes de repetir a ação"));
  }
  last.set(k, now);
  const token = useAuthStore.getState().token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (axios.isCancel(err)) return Promise.reject(err);
    const status = err.response?.status;
    if (status === 401) {
      useAuthStore.getState().logout();
      toast.error("Sessão expirada. Faça login novamente.");
      if (location.pathname !== "/login") location.href = "/login";
    } else if (status >= 500) {
      toast.error("Erro no servidor. Tente novamente.");
    }
    return Promise.reject(err);
  }
);