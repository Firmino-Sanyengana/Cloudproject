import { useParams } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { api } from "@/api/client";
import Skeleton from "@/components/ui/Skeleton";
import DOMPurify from "dompurify";
import { Volume2, CheckCircle2, Lightbulb } from "lucide-react";
import { toast } from "sonner";
import { useMemo, useState } from "react";

const TYPE_LABEL = {
  FILL_BLANK: "Preencher lacuna",
  SCRAMBLED: "Frase embaralhada",
  TRANSLATE: "Tradução",
};

export default function Lesson() {
  const { id } = useParams();
  const { data: lesson, isLoading } = useQuery({
    queryKey: ["lesson", id],
    queryFn: async () => (await api.get(`/lessons/${id}`)).data,
  });
  const complete = useMutation({
    mutationFn: () => api.post(`/lessons/${id}/complete`),
    onSuccess: () => toast.success("Lição marcada como concluída!"),
  });

  const speak = (text, lang = "en-US") => {
    if (!("speechSynthesis" in window)) return toast.error("O navegador não suporta TTS");
    const u = new SpeechSynthesisUtterance(text); u.lang = lang;
    window.speechSynthesis.speak(u);
  };

  if (isLoading) return <Skeleton className="h-72" />;
  if (!lesson) return null;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <header>
        <p className="text-sm text-slate-500">{lesson.course?.title}</p>
        <h1 className="text-3xl font-bold">{lesson.title}</h1>
      </header>
      <article className="card p-6 prose dark:prose-invert max-w-none"
        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(lesson.content.replace(/\n/g, "<br/>")) }} />

      <div className="flex flex-wrap gap-2">
        <button className="btn-secondary" onClick={() => speak(lesson.content)}>
          <Volume2 size={16} /> Ouvir pronúncia
        </button>
        <button className="btn-primary" onClick={() => complete.mutate()}>
          <CheckCircle2 size={16} /> Marcar concluída
        </button>
      </div>

      {lesson.exercises?.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold mb-3">Exercícios</h2>
          <div className="space-y-3">
            {lesson.exercises.map((ex) => <ExerciseItem key={ex.id} ex={ex} />)}
          </div>
        </section>
      )}

      {lesson.quizzes?.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold mb-3">Quiz</h2>
          <div className="space-y-3">
            {lesson.quizzes.map((q) => <QuizItem key={q.id} q={q} />)}
          </div>
        </section>
      )}
    </div>
  );
}

function ScrambledTokens({ answer }) {
  // mostra as palavras embaralhadas como dica
  const tokens = useMemo(() => answer.split(/\s+/).sort(() => Math.random() - 0.5), [answer]);
  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {tokens.map((t, i) => (
        <span key={i} className="px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-xs">{t}</span>
      ))}
    </div>
  );
}

function ExerciseItem({ ex }) {
  const [val, setVal] = useState("");
  const [res, setRes] = useState(null);
  const [showHint, setShowHint] = useState(false);

  const submit = useMutation({
    mutationFn: () => api.post(`/exercises/${ex.id}/attempt`, { answer: val }),
    onSuccess: ({ data }) => setRes(data),
  });

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between gap-2">
        <span className="badge bg-brand-100 text-brand-800 dark:bg-slate-800 dark:text-brand-200">
          {TYPE_LABEL[ex.type] || ex.type}
        </span>
        {ex.hint && (
          <button className="btn-ghost text-xs" onClick={() => setShowHint((s) => !s)}>
            <Lightbulb size={14}/> Dica
          </button>
        )}
      </div>
      <p className="font-medium mt-2">{ex.prompt}</p>
      {showHint && ex.hint && <p className="text-xs text-amber-700 mt-1">💡 {ex.hint}</p>}
      {ex.type === "SCRAMBLED" && <ScrambledTokens answer={ex.answer} />}
      <div className="mt-2 flex gap-2">
        <input className="input" value={val} onChange={(e) => setVal(e.target.value)}
          placeholder={ex.type === "TRANSLATE" ? "Escreve a tradução..." : "A tua resposta..."} />
        <button className="btn-primary" disabled={!val.trim() || submit.isPending} onClick={() => submit.mutate()}>
          Verificar
        </button>
      </div>
      {res?.correct === true && <p className="text-emerald-600 text-sm mt-2">✅ Correto!</p>}
      {res?.correct === false && (
        <p className="text-red-600 text-sm mt-2">❌ Resposta esperada: <span className="font-mono">{res.expected}</span></p>
      )}
    </div>
  );
}

function QuizItem({ q }) {
  const options = JSON.parse(q.options);
  const [picked, setPicked] = useState(null);
  const [res, setRes] = useState(null);
  const submit = async () => {
    if (picked === null) return;
    const { data } = await api.post(`/quizzes/${q.id}/attempt`, { answer: picked });
    setRes(data);
  };
  return (
    <div className="card p-4">
      <p className="font-medium">{q.question}</p>
      <div className="grid sm:grid-cols-2 gap-2 mt-3">
        {options.map((o, i) => (
          <label key={i} className={`border rounded-xl px-3 py-2 cursor-pointer text-sm ${picked === i ? "border-brand-500 bg-brand-50 dark:bg-slate-800" : "border-slate-300 dark:border-slate-700"}`}>
            <input type="radio" className="mr-2" checked={picked === i} onChange={() => setPicked(i)} />{o}
          </label>
        ))}
      </div>
      <div className="mt-3 flex items-center gap-3">
        <button className="btn-primary" onClick={submit}>Enviar</button>
        {res && (res.score === 1
          ? <span className="text-emerald-600 text-sm">Acertou!</span>
          : <span className="text-red-600 text-sm">Errou. Correta: {options[res.correct]}</span>)}
      </div>
    </div>
  );
}
