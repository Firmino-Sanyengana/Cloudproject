import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { api } from "@/api/client";
import { Field } from "@/components/ui/Field";
import { toast } from "sonner";
import { Search, Send } from "lucide-react";

export default function AdminMessages() {
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ subject: "", body: "", sendEmail: true });

  const { data: students = [] } = useQuery({
    queryKey: ["search-students", q],
    queryFn: async () => (await api.get(`/admin-messages/search-students?q=${encodeURIComponent(q)}`)).data,
  });

  const send = useMutation({
    mutationFn: () => api.post("/admin-messages", { ...form, toId: selected.id }),
    onSuccess: () => {
      toast.success("Mensagem enviada");
      setForm({ subject: "", body: "", sendEmail: true });
      setSelected(null);
    },
    onError: (e) => toast.error(e.response?.data?.message || "Erro"),
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Mensagens</h1>
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card p-4 space-y-3">
          <Field label="Pesquisar aluno (nome ou email)">
            <div className="relative">
              <Search size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400" />
              <input className="input pl-8" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Ex: Ana" />
            </div>
          </Field>
          <div className="divide-y divide-slate-200 dark:divide-slate-800 max-h-96 overflow-y-auto">
            {students.map((s) => (
              <button key={s.id}
                className={`w-full text-left p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded ${selected?.id === s.id ? "bg-brand-50 dark:bg-slate-800" : ""}`}
                onClick={() => setSelected(s)}>
                <p className="text-sm font-medium">{s.name}</p>
                <p className="text-xs text-slate-500">{s.email}</p>
              </button>
            ))}
            {students.length === 0 && <p className="text-sm text-slate-500 p-2">Sem resultados.</p>}
          </div>
        </div>

        <form className="card p-4 space-y-3" onSubmit={(e) => { e.preventDefault(); if (selected) send.mutate(); }}>
          <h3 className="font-semibold">Enviar para: {selected ? <span className="text-brand-700">{selected.name}</span> : <span className="text-slate-400">— escolhe um aluno</span>}</h3>
          <Field label="Assunto">
            <input className="input" required value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
          </Field>
          <Field label="Mensagem (SMS / Notificação)">
            <textarea className="input" rows={6} required value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} />
          </Field>
          <label className="text-sm flex items-center gap-2">
            <input type="checkbox" checked={form.sendEmail} onChange={(e) => setForm({ ...form, sendEmail: e.target.checked })} />
            Enviar também por email
          </label>
          <button className="btn-primary" disabled={!selected || send.isPending}>
            <Send size={14}/> Enviar
          </button>
        </form>
      </div>
    </div>
  );
}
