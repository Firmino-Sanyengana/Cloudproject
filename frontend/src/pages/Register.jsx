import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { api } from "@/api/client";
import { toast } from "sonner";
import { Field } from "@/components/ui/Field";

const schema = z.object({
  name: z
    .string()
    .min(2, "Nome muito curto")
    .max(80, "Nome muito longo")
    .regex(/^[A-Za-zÀ-ÖØ-öø-ÿ\s'-]+$/, "O nome não pode conter números ou símbolos"),
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "Mínimo 6 caracteres"),
});

export default function Register() {
  const nav = useNavigate();
  const { register, handleSubmit, formState: { errors, isSubmitting } } =
    useForm({ resolver: zodResolver(schema) });

  const [registeredEmail, setRegisteredEmail] = useState(null);

  const onSubmit = async (v) => {
    try {
      const { data } = await api.post("/auth/register", v);
      setRegisteredEmail(v.email);
      toast.success(data.message || "Conta criada com sucesso!");
    } catch (e) {
      toast.error(e.response?.data?.message || "Erro ao registar");
    }
  };

  if (registeredEmail) {
    return (
      <div className="card p-8 text-center">
        <h1 className="text-2xl font-bold mb-2">Confirme o seu e-mail</h1>
        <p className="text-sm text-slate-500 mb-4">
          Enviámos um link de confirmação para <span className="font-medium text-slate-700 dark:text-slate-300">{registeredEmail}</span>.
          Abra o seu e-mail e clique no link para ativar a conta antes de entrar.
        </p>
        <p className="text-xs text-slate-400 mb-6">
          Não recebeu? Verifique a pasta de spam ou tente novamente mais tarde na página de entrada.
        </p>
        <button className="btn-primary w-full" onClick={() => nav("/login")}>
          Ir para o login
        </button>
      </div>
    );
  }

  return (
    <div className="card p-8">
      <h1 className="text-2xl font-bold mb-1 text-center">Criar conta</h1>
      <p className="text-sm text-slate-500 text-center mb-6">Começa a aprender línguas hoje</p>
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <Field label="Nome completo" error={errors.name?.message}>
          <input className="input"  {...register("name")} />
        </Field>
        <Field label="E-mail" error={errors.email?.message}>
          <input className="input" autoComplete="email" {...register("email")} />
        </Field>
        <Field label="Senha" error={errors.password?.message}>
          <input className="input" type="password" autoComplete="new-password" {...register("password")} />
        </Field>
        <button className="btn-primary w-full" disabled={isSubmitting}>Criar conta</button>
      </form>
      <p className="mt-4 text-sm text-center text-slate-500">
        Já tens conta? <Link to="/login" className="text-brand-700 dark:text-brand-300 hover:underline">Entrar</Link>
      </p>
    </div>
  );
}