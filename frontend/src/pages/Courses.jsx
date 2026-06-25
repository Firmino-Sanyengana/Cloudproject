import { useQuery } from "@tanstack/react-query";
import { api, BACKEND_URL } from "@/api/client";
import { Link } from "react-router-dom";
import Skeleton from "@/components/ui/Skeleton";
import Badge from "@/components/ui/Badge";
import { BookOpen, Users } from "lucide-react";

export default function Courses() {
  const { data, isLoading } = useQuery({
    queryKey: ["courses"],
    queryFn: async () => (await api.get("/courses")).data,
  });

  return (
    <div>
      <header className="mb-8">
        <h1 className="text-3xl font-bold">Cursos disponíveis</h1>
        <p className="text-slate-500 mt-1">Escolha um curso e inscreva-se. Após a aprovação do admin, o curso fica disponível.</p>
      </header>
      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-56" />)}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {data?.map((c) => (
            <Link key={c.id} to={`/courses/${c.id}`} className="card overflow-hidden group hover:shadow-lg transition">
              {c.cover && <img src={c.cover.startsWith("http") ? c.cover : BACKEND_URL + c.cover} alt="" className="h-40 w-full object-cover group-hover:scale-105 transition" />}
              <div className="p-5">
                <div className="flex items-center gap-2 mb-2"><Badge kind={c.level} /><span className="text-xs text-slate-500 uppercase">{c.language}</span></div>
                <h3 className="font-semibold text-lg">{c.title}</h3>
                <p className="text-sm text-slate-500 mt-1 line-clamp-2">{c.description}</p>
                <div className="flex gap-4 mt-3 text-xs text-slate-500">
                  <span className="inline-flex items-center gap-1"><BookOpen size={12} />{c._count?.lessons || 0} lições</span>
                  <span className="inline-flex items-center gap-1"><Users size={12} />{c._count?.enrollments || 0} alunos</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
