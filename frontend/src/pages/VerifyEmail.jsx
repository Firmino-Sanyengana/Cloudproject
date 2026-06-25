import { useEffect, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { api } from "@/api/client";
import { useAuthStore } from "@/store/auth";
import { toast } from "sonner";

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const nav = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [status, setStatus] = useState("loading"); // loading | success | error
  const [message, setMessage] = useState("A confirmar o seu e-mail...");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Link de confirmação inválido.");
      return;
    }
    (async () => {
      try {
        const { data } = await api.get("/auth/verify-email", { params: { token } });
        setAuth(data.token, data.user);
        setStatus("success");
        setMessage("E-mail confirmado com sucesso! A entrar...");
        toast.success("Conta ativada com sucesso!");
        setTimeout(() => nav("/"), 1500);
      } catch (e) {
        setStatus("error");
        setMessage(e.response?.data?.message || "Não foi possível confirmar o e-mail.");
      }
    })();
  }, [token, nav, setAuth]);

  return (
    <div className="card p-8 text-center">
      <h1 className="text-2xl font-bold mb-2">Confirmação de e-mail</h1>
      <p className={`text-sm mb-4 ${status === "error" ? "text-red-500" : "text-slate-500"}`}>
        {message}
      </p>
      {status === "error" && (
        <Link to="/login" className="text-brand-700 dark:text-brand-300 hover:underline text-sm">
          Voltar para o login
        </Link>
      )}
    </div>
  );
}