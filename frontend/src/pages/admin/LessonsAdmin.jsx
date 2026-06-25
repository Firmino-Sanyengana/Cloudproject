import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/api/client";
import { Field } from "@/components/ui/Field";
import { toast } from "sonner";
import { Plus, Trash2, BookOpen, ListChecks, HelpCircle } from "lucide-react";

export default function LessonsAdmin() {
  const qc = useQueryClient();
  const [courseId, setCourseId] = useState("");

  const { data: courses } = useQuery({
    queryKey: ["courses"], queryFn: async () => (await api.get("/courses")).data,
  });
  const { data: lessons } = useQuery({
    queryKey: ["lessons-by-course", courseId],
    queryFn: async () => (await api.get(`/lessons/by-course/${courseId}`)).data,
    enabled: !!courseId,
  });

  const [lessonForm, setLessonForm] = useState({ title: "", content: "", order: 1 });
  const createLesson = useMutation({
    mutationFn: () => api.post("/lessons", { ...lessonForm, courseId: Number(courseId) }),
    onSuccess: () => {
      toast.success("Lição criada");
      setLessonForm({ title: "", content: "", order: (lessons?.length || 0) + 1 });
      qc.invalidateQueries({ queryKey: ["lessons-by-course", courseId] });
    },
  });
  const delLesson = useMutation({
    mutationFn: (id) => api.delete(`/lessons/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["lessons-by-course", courseId] }),
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold flex items-center gap-2"><BookOpen/> Lições, exercícios e quizzes</h1>

      <Field label="Selecionar curso">
        <select className="input" value={courseId} onChange={(e) => setCourseId(e.target.value)}>
          <option value="">— escolhe —</option>
          {courses?.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
        </select>
      </Field>

      {courseId && (
        <>
          <form className="card p-4 grid sm:grid-cols-[1fr_120px_auto] gap-3 items-end"
            onSubmit={(e) => { e.preventDefault(); createLesson.mutate(); }}>
            <Field label="Título da nova lição">
              <input className="input" required value={lessonForm.title}
                onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })} />
            </Field>
            <Field label="Ordem">
              <input type="number" className="input" required value={lessonForm.order}
                onChange={(e) => setLessonForm({ ...lessonForm, order: Number(e.target.value) })} />
            </Field>
            <button className="btn-primary"><Plus size={14}/> Adicionar</button>
            <div className="sm:col-span-3">
              <Field label="Conteúdo">
                <textarea className="input" rows={3} required value={lessonForm.content}
                  onChange={(e) => setLessonForm({ ...lessonForm, content: e.target.value })} />
              </Field>
            </div>
          </form>

          <div className="space-y-3">
            {lessons?.map((l) => (
              <LessonRow key={l.id} lesson={l} onDelete={() => confirm("Apagar lição?") && delLesson.mutate(l.id)} />
            ))}
            {lessons?.length === 0 && <p className="text-slate-500 text-sm">Sem lições neste curso.</p>}
          </div>
        </>
      )}
    </div>
  );
}

function LessonRow({ lesson, onDelete }) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [ex, setEx] = useState({ type: "FILL_BLANK", prompt: "", answer: "", hint: "" });
  const [qz, setQz] = useState({ question: "", options: ["", "", "", ""], correct: 0 });

  const addEx = useMutation({
    mutationFn: () => api.post("/exercises", { ...ex, lessonId: lesson.id, hint: ex.hint || null }),
    onSuccess: () => { toast.success("Exercício adicionado"); setEx({ type: "FILL_BLANK", prompt: "", answer: "", hint: "" });
      qc.invalidateQueries({ queryKey: ["lessons-by-course"] }); },
  });
  const addQz = useMutation({
    mutationFn: () => api.post("/quizzes", { ...qz, lessonId: lesson.id, options: qz.options.filter(Boolean) }),
    onSuccess: () => { toast.success("Quiz adicionado"); setQz({ question: "", options: ["", "", "", ""], correct: 0 });
      qc.invalidateQueries({ queryKey: ["lessons-by-course"] }); },
  });

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between">
        <button className="text-left flex-1" onClick={() => setOpen(!open)}>
          <p className="font-semibold">{lesson.order}. {lesson.title}</p>
          <p className="text-xs text-slate-500">
            <ListChecks size={12} className="inline"/> {lesson._count?.exercises || 0} exercícios •{" "}
            <HelpCircle size={12} className="inline"/> {lesson._count?.quizzes || 0} quizzes
          </p>
        </button>
        <button className="btn-ghost text-red-600" onClick={onDelete}><Trash2 size={14}/></button>
      </div>

      {open && (
        <div className="mt-4 grid lg:grid-cols-2 gap-4">
          <form className="space-y-2 border-t pt-3 border-slate-200 dark:border-slate-800"
            onSubmit={(e) => { e.preventDefault(); addEx.mutate(); }}>
            <h4 className="font-semibold text-sm">+ Novo exercício</h4>
            <select className="input" value={ex.type} onChange={(e) => setEx({ ...ex, type: e.target.value })}>
              <option value="FILL_BLANK">Preencher lacuna</option>
              <option value="SCRAMBLED">Frase embaralhada</option>
              <option value="TRANSLATE">Tradução</option>
            </select>
            <input className="input" placeholder="Enunciado" required value={ex.prompt}
              onChange={(e) => setEx({ ...ex, prompt: e.target.value })} />
            <input className="input" placeholder="Resposta esperada" required value={ex.answer}
              onChange={(e) => setEx({ ...ex, answer: e.target.value })} />
            <input className="input" placeholder="Dica (opcional)" value={ex.hint}
              onChange={(e) => setEx({ ...ex, hint: e.target.value })} />
            <button className="btn-primary text-sm"><Plus size={12}/> Adicionar exercício</button>
          </form>

          <form className="space-y-2 border-t pt-3 border-slate-200 dark:border-slate-800"
            onSubmit={(e) => { e.preventDefault(); addQz.mutate(); }}>
            <h4 className="font-semibold text-sm">+ Novo quiz</h4>
            <input className="input" placeholder="Pergunta" required value={qz.question}
              onChange={(e) => setQz({ ...qz, question: e.target.value })} />
            {qz.options.map((opt, i) => (
              <div key={i} className="flex items-center gap-2">
                <input type="radio" checked={qz.correct === i} onChange={() => setQz({ ...qz, correct: i })} />
                <input className="input flex-1" placeholder={`Opção ${i + 1}`} value={opt}
                  onChange={(e) => { const n = [...qz.options]; n[i] = e.target.value; setQz({ ...qz, options: n }); }} />
              </div>
            ))}
            <button className="btn-primary text-sm"><Plus size={12}/> Adicionar quiz</button>
          </form>
        </div>
      )}
    </div>
  );
}
