import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "@/api/client";
import { toast } from "sonner";
import { Field } from "@/components/ui/Field";

export default function ForgotPassword() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/password/forgot", { email });
      toast.success("Se o email existir, um código foi enviado.");
      nav(`/reset-password?email=${encodeURIComponent(email)}`);
    } catch (e) {
      toast.error(e.response?.data?.message || "Erro");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card p-8">
      <h1 className="text-2xl font-bold mb-1 text-center">Recuperar senha</h1>
      <p className="text-sm text-slate-500 text-center mb-6">
        Vamos enviar-te um código de 6 dígitos para o teu email.
      </p>
      <form className="space-y-4" onSubmit={submit}>
        <Field label="E-mail registado">
          <input className="input" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </Field>
        <button className="btn-primary w-full" disabled={loading}>
          {loading ? "A enviar..." : "Enviar código"}
        </button>
      </form>
      <p className="mt-4 text-sm text-center text-slate-500">
        <Link to="/login" className="text-brand-700 dark:text-brand-300 hover:underline">Voltar a Entrar</Link>
      </p>
    </div>
  );
}
