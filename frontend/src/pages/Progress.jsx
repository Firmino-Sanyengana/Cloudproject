import { useQuery } from "@tanstack/react-query";
import { api } from "@/api/client";
import Skeleton from "@/components/ui/Skeleton";

export default function ProgressPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["progress"],
    queryFn: async () => (await api.get("/progress/me")).data,
  });

  if (isLoading) return <Skeleton className="h-40" />;
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Meu progresso</h1>
      <div className="grid sm:grid-cols-3 gap-4">
        <Stat title="Cursos aprovados" value={data?.courses?.length || 0} />
        <Stat title="Tentativas de quiz" value={data?.quizAttempts || 0} />
        <Stat title="Acertos em quizzes" value={data?.quizScore || 0} />
      </div>
      <section>
        <h2 className="text-xl font-semibold mb-3">Cursos</h2>
        <div className="space-y-3">
          {data?.courses?.map((c) => (
            <div key={c.course.id} className="card p-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-medium">{c.course.title}</h3>
                <span className="text-sm text-slate-500">{c.completed}/{c.total} lições</span>
              </div>
              <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                <div className="h-full bg-brand-600 transition-all" style={{ width: `${c.pct}%` }} />
              </div>
            </div>
          ))}
          {!data?.courses?.length && <p className="text-slate-500">Inscreva-se em um curso para começar.</p>}
        </div>
      </section>
    </div>
  );
}
function Stat({ title, value }) {
  return (
    <div className="card p-5">
      <p className="text-sm text-slate-500">{title}</p>
      <p className="text-3xl font-bold mt-1">{value}</p>
    </div>
  );
}
