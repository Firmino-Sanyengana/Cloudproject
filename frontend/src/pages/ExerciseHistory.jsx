import { useQuery } from "@tanstack/react-query";
import { api } from "@/api/client";
import Skeleton from "@/components/ui/Skeleton";
import { History as HistoryIcon, Check, X } from "lucide-react";

const typeLabel = { FILL_BLANK: "Preencher lacuna", SCRAMBLED: "Frase embaralhada", TRANSLATE: "Tradução" };

export default function ExerciseHistory() {
  const { data: ex, isLoading: lEx } = useQuery({
    queryKey: ["my-ex-history"],
    queryFn: async () => (await api.get("/exercises/history/me")).data,
  });
  const { data: qz, isLoading: lQ } = useQuery({
    queryKey: ["my-quiz-history"],
    queryFn: async () => (await api.get("/quizzes/history/me")).data,
  });

  if (lEx || lQ) return <Skeleton className="h-40" />;

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold flex items-center gap-2"><HistoryIcon /> Histórico de atividades</h1>

      <section>
        <h2 className="text-lg font-semibold mb-3">Exercícios ({ex?.length || 0})</h2>
        <div className="card divide-y divide-slate-200 dark:divide-slate-800">
          {(!ex || ex.length === 0) && <p className="p-4 text-slate-500 text-sm">Ainda sem tentativas.</p>}
          {ex?.map((a) => (
            <div key={a.id} className="p-4 flex items-start gap-3">
              <div className={`mt-1 h-7 w-7 rounded-full flex items-center justify-center ${a.correct ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
                {a.correct ? <Check size={14}/> : <X size={14}/>}
              </div>
              <div className="flex-1 text-sm">
                <p className="font-medium">{a.exercise?.prompt}</p>
                <p className="text-slate-500 text-xs">
                  {typeLabel[a.exercise?.type] || a.exercise?.type} • {a.exercise?.lesson?.course?.title} — {a.exercise?.lesson?.title}
                </p>
                <p className="text-xs mt-1">A tua resposta: <span className="font-mono">{a.answer}</span></p>
                {!a.correct && <p className="text-xs text-slate-500">Resposta esperada: <span className="font-mono">{a.exercise?.answer}</span></p>}
              </div>
              <span className="text-xs text-slate-400">{new Date(a.createdAt).toLocaleString()}</span>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-3">Quizzes ({qz?.length || 0})</h2>
        <div className="card divide-y divide-slate-200 dark:divide-slate-800">
          {(!qz || qz.length === 0) && <p className="p-4 text-slate-500 text-sm">Ainda sem tentativas.</p>}
          {qz?.map((a) => (
            <div key={a.id} className="p-4 flex items-start gap-3">
              <div className={`mt-1 h-7 w-7 rounded-full flex items-center justify-center ${a.score ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
                {a.score ? <Check size={14}/> : <X size={14}/>}
              </div>
              <div className="flex-1 text-sm">
                <p className="font-medium">{a.quiz?.question}</p>
                <p className="text-slate-500 text-xs">{a.quiz?.lesson?.course?.title} — {a.quiz?.lesson?.title}</p>
              </div>
              <span className="text-xs text-slate-400">{new Date(a.createdAt).toLocaleString()}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
