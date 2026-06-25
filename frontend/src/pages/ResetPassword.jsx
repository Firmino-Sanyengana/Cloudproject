import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { api } from "@/api/client";
import { toast } from "sonner";
import { Field } from "@/components/ui/Field";

export default function ResetPassword() {
  const [params] = useSearchParams();
  const nav = useNavigate();
  const [form, setForm] = useState({
    email: params.get("email") || "",
    code: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/password/reset", form);
      toast.success("Senha alterada! Faz login.");
      nav("/login");
    } catch (e) {
      toast.error(e.response?.data?.message || "Erro");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card p-8">
      <h1 className="text-2xl font-bold mb-1 text-center">Nova senha</h1>
      <p className="text-sm text-slate-500 text-center mb-6">
        Introduz o código de 6 dígitos que recebeste por email.
      </p>
      <form className="space-y-4" onSubmit={submit}>
        <Field label="E-mail">
          <input className="input" type="email" required value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </Field>
        <Field label="Código de recuperação (6 dígitos)">
          <input className="input tracking-widest text-center text-lg" maxLength={6} required value={form.code}
            onChange={(e) => setForm({ ...form, code: e.target.value.replace(/\D/g, "") })} />
        </Field>
        <Field label="Nova senha">
          <input className="input" type="password" minLength={6} required value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })} />
        </Field>
        <button className="btn-primary w-full" disabled={loading}>
          {loading ? "A guardar..." : "Redefinir senha"}
        </button>
      </form>
      <p className="mt-4 text-sm text-center text-slate-500">
        <Link to="/login" className="text-brand-700 dark:text-brand-300 hover:underline">Voltar a Entrar</Link>
      </p>
    </div>
  );
}
