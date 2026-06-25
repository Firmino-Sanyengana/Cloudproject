import { useRef, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, BACKEND_URL } from "@/api/client";
import Skeleton from "@/components/ui/Skeleton";
import { Field } from "@/components/ui/Field";
import { toast } from "sonner";
import { Trash2, Upload, ImageIcon } from "lucide-react";

const emptyForm = { title: "", description: "", level: "BEGINNER", language: "en", cover: "" };

export default function CoursesAdmin() {
  const qc = useQueryClient();
  const fileRef = useRef(null);
  const [form, setForm] = useState(emptyForm);
  const [uploading, setUploading] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["courses"],
    queryFn: async () => (await api.get("/courses")).data,
  });

  const create = useMutation({
    mutationFn: () => api.post("/courses", { ...form, cover: form.cover || null }),
    onSuccess: () => {
      toast.success("Curso criado");
      qc.invalidateQueries({ queryKey: ["courses"] });
      setForm(emptyForm);
    },
    onError: (e) => toast.error(e.response?.data?.message || "Erro"),
  });
  const del = useMutation({
    mutationFn: (id) => api.delete(`/courses/${id}`),
    onSuccess: () => { toast.success("Removido"); qc.invalidateQueries({ queryKey: ["courses"] }); },
  });

  const handleFile = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", f);
      const { data } = await api.post("/uploads/image", fd, { headers: { "Content-Type": "multipart/form-data" } });
      setForm((s) => ({ ...s, cover: data.url }));
      toast.success("Imagem carregada");
    } catch (err) {
      toast.error(err.response?.data?.message || "Erro no upload");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const coverSrc = form.cover?.startsWith("http") ? form.cover : form.cover ? BACKEND_URL + form.cover : null;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Cursos</h1>

      <form className="card p-6 grid sm:grid-cols-2 gap-3" onSubmit={(e) => { e.preventDefault(); create.mutate(); }}>
        <Field label="Título"><input className="input" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></Field>
        <Field label="Idioma (ex: en, pt)"><input className="input" required value={form.language} onChange={(e) => setForm({ ...form, language: e.target.value })} /></Field>
        <Field label="Nível">
          <select className="input" value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })}>
            <option value="BEGINNER">Iniciante</option>
            <option value="INTERMEDIATE">Intermédio</option>
            <option value="ADVANCED">Avançado</option>
          </select>
        </Field>

        <Field label="Capa do curso (imagem)">
          <div className="flex items-center gap-2">
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
            <button type="button" className="btn-secondary" onClick={() => fileRef.current?.click()} disabled={uploading}>
              <Upload size={14}/> {uploading ? "A enviar..." : "Carregar imagem"}
            </button>
            {coverSrc && (
              <img src={coverSrc} alt="capa" className="h-12 w-20 object-cover rounded-md border border-slate-200 dark:border-slate-700" />
            )}
            {!coverSrc && <span className="text-xs text-slate-400 flex items-center gap-1"><ImageIcon size={12}/> nenhuma imagem</span>}
          </div>
        </Field>

        <div className="sm:col-span-2">
          <Field label="Descrição">
            <textarea className="input" rows={3} required value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </Field>
        </div>
        <div className="sm:col-span-2">
          <button className="btn-primary" disabled={create.isPending}>Criar curso</button>
        </div>
      </form>

      {isLoading ? <Skeleton className="h-40" /> : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800 text-left">
              <tr>
                <th className="p-3">Capa</th><th className="p-3">Título</th><th className="p-3">Nível</th>
                <th className="p-3">Idioma</th><th className="p-3">Lições</th><th className="p-3">Inscritos</th>
                <th className="p-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {data?.map((c) => {
                const cov = c.cover?.startsWith("http") ? c.cover : c.cover ? BACKEND_URL + c.cover : null;
                return (
                  <tr key={c.id} className="border-t border-slate-200 dark:border-slate-800">
                    <td className="p-3">
                      {cov
                        ? <img src={cov} alt="" className="h-10 w-16 object-cover rounded" />
                        : <div className="h-10 w-16 bg-slate-100 dark:bg-slate-800 rounded flex items-center justify-center text-slate-400"><ImageIcon size={14}/></div>}
                    </td>
                    <td className="p-3 font-medium">{c.title}</td>
                    <td className="p-3">{c.level}</td>
                    <td className="p-3">{c.language}</td>
                    <td className="p-3">{c._count?.lessons || 0}</td>
                    <td className="p-3">{c._count?.enrollments || 0}</td>
                    <td className="p-3 text-right">
                      <button className="btn-ghost text-red-600" onClick={() => confirm("Apagar curso?") && del.mutate(c.id)}>
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
