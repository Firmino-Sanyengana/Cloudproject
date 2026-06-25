import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/api/client";
import Skeleton from "@/components/ui/Skeleton";
import Badge from "@/components/ui/Badge";
import { toast } from "sonner";
import { useAuthStore } from "@/store/auth";

export default function CourseDetail() {
  const { id } = useParams();
  const qc = useQueryClient();
  const { user } = useAuthStore();
  const { data: course, isLoading } = useQuery({
    queryKey: ["course", id],
    queryFn: async () => (await api.get(`/courses/${id}`)).data,
  });
  const { data: mine } = useQuery({
    queryKey: ["my-enrollments"],
    queryFn: async () => (await api.get("/enrollments/me")).data,
    enabled: !!user,
  });
  const enroll = useMutation({
    mutationFn: () => api.post(`/enrollments/${id}`),
    onSuccess: () => { toast.success("Inscrição enviada. Aguarde aprovação."); qc.invalidateQueries({ queryKey: ["my-enrollments"] }); },
    onError: (e) => toast.error(e.response?.data?.message || "Falha ao inscrever"),
  });

  const myEnr = mine?.find((e) => e.courseId === Number(id));

  if (isLoading) return <Skeleton className="h-72" />;
  if (!course) return <p>Curso não encontrado.</p>;

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-6">
        {course.cover && <img src={course.cover} alt="" className="rounded-2xl h-72 w-full object-cover" />}
        <div className="flex items-center gap-2">
          <Badge kind={course.level} />
          <span className="text-xs text-slate-500 uppercase">{course.language}</span>
        </div>
        <h1 className="text-3xl font-bold">{course.title}</h1>
        <p className="text-slate-600 dark:text-slate-300">{course.description}</p>
        <section>
          <h2 className="text-xl font-semibold mb-3">Lições</h2>
          <ol className="space-y-2">
            {course.lessons?.map((l, i) => (
              <li key={l.id} className="card p-4 flex items-center justify-between">
                <div><span className="text-sm text-slate-400">#{i + 1}</span> <span className="font-medium ml-2">{l.title}</span></div>
                {myEnr?.status === "APPROVED" ? (
                  <Link to={`/lessons/${l.id}`} className="btn-secondary">Abrir</Link>
                ) : (
                  <span className="text-xs text-slate-400">Bloqueada</span>
                )}
              </li>
            ))}
          </ol>
        </section>
      </div>
      <aside className="card p-6 h-fit space-y-3 sticky top-24">
        <h3 className="font-semibold">Inscrição</h3>
        {!user && <p className="text-sm text-slate-500">Faça login para se inscrever.</p>}
        {user && !myEnr && (
          <button onClick={() => enroll.mutate()} disabled={enroll.isPending} className="btn-primary w-full">
            {enroll.isPending ? "Enviando..." : "Inscrever-me"}
          </button>
        )}
        {myEnr && (
          <div className="space-y-2">
            <p className="text-sm">Status:</p>
            <Badge kind={myEnr.status} />
            {myEnr.status === "PENDING" && <p className="text-xs text-slate-500">Aguarde a aprovação do administrador.</p>}
            {myEnr.status === "APPROVED" && <p className="text-xs text-emerald-600">Você já tem acesso às lições!</p>}
            {myEnr.status === "REJECTED" && <p className="text-xs text-red-600">Sua inscrição foi rejeitada.</p>}
          </div>
        )}
      </aside>
    </div>
  );
}
