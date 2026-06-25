import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuthStore } from "@/store/auth";
import { api } from "@/api/client";
import { toast } from "sonner";
import { Field } from "@/components/ui/Field";

const schema = z.object({
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "Mínimo 6 caracteres"),
});

export default function Login() {
  const nav = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const { register, handleSubmit, getValues, formState: { errors, isSubmitting } } =
    useForm({ resolver: zodResolver(schema) });

  const [unverifiedEmail, setUnverifiedEmail] = useState(null);
  const [resending, setResending] = useState(false);

  const onSubmit = async (v) => {
    setUnverifiedEmail(null);
    try {
      const { data } = await api.post("/auth/login", v);
      setAuth(data.token, data.user);
      toast.success(`Bem-vindo, ${data.user.name}!`);
      nav(data.user.role === "ADMIN" ? "/admin" : "/");
    } catch (e) {
      const code = e.response?.data?.code;
      const message = e.response?.data?.message || "Erro ao entrar";
      toast.error(message);
      if (code === "EMAIL_NOT_VERIFIED") {
        setUnverifiedEmail(v.email);
      }
    }
  };

  const handleResend = async () => {
    const email = unverifiedEmail || getValues("email");
    if (!email) return;
    setResending(true);
    try {
      const { data } = await api.post("/auth/resend-verification", { email });
      toast.success(data.message || "E-mail de confirmação reenviado.");
    } catch (e) {
      toast.error(e.response?.data?.message || "Erro ao reenviar e-mail");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="card p-8">
      <h1 className="text-2xl font-bold mb-1 text-center">Entrar</h1>
      <p className="text-sm text-slate-500 text-center mb-6">Acede à sua conta Sofulano Ukulondja</p>
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <Field label="E-mail" error={errors.email?.message}>
          <input className="input" autoComplete="email" {...register("email")} />
        </Field>
        <Field label="Senha" error={errors.password?.message}>
          <input className="input" type="password" autoComplete="current-password" {...register("password")} />
        </Field>
        <button className="btn-primary w-full" disabled={isSubmitting}>Entrar</button>
      </form>

      {unverifiedEmail && (
        <div className="mt-4 text-sm text-center bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
          <p className="text-amber-700 dark:text-amber-300 mb-2">
            A sua conta ainda não foi confirmada. Verifique a sua caixa de entrada.
          </p>
          <button
            type="button"
            onClick={handleResend}
            disabled={resending}
            className="text-brand-700 dark:text-brand-300 hover:underline font-medium disabled:opacity-50"
          >
            {resending ? "A reenviar..." : "Reenviar e-mail de confirmação"}
          </button>
        </div>
      )}

      <div className="mt-4 text-sm flex flex-col items-center gap-1">
        <Link to="/forgot-password" className="text-brand-700 dark:text-brand-300 hover:underline">
          Esqueci a senha
        </Link>
        <span className="text-slate-500">
          Ainda não tens conta? <Link to="/register" className="text-brand-700 dark:text-brand-300 hover:underline">Criar conta</Link>
        </span>
      </div>
    </div>
  );
}