import { useQuery } from "@tanstack/react-query";
import { api, BACKEND_URL } from "@/api/client";
import { Link } from "react-router-dom";
import Badge from "@/components/ui/Badge";
import Skeleton from "@/components/ui/Skeleton";
import { MessagesSquare, BookOpen } from "lucide-react";

export default function MyCourses() {
  const { data, isLoading } = useQuery({
    queryKey: ["my-enrollments"],
    queryFn: async () => (await api.get("/enrollments/me")).data,
  });
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Meus cursos</h1>
      {isLoading ? <Skeleton className="h-40" /> : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {data?.length ? data.map((e) => {
            const cov = e.course.cover?.startsWith("http") ? e.course.cover : e.course.cover ? BACKEND_URL + e.course.cover : null;
            return (
              <div key={e.id} className="card overflow-hidden">
                {cov && <img src={cov} alt="" className="h-32 w-full object-cover" />}
                <div className="p-5">
                  <div className="flex justify-between items-start">
                    <h3 className="font-semibold">{e.course.title}</h3>
                    <Badge kind={e.status} />
                  </div>
                  <p className="text-sm text-slate-500 mt-2 line-clamp-2">{e.course.description}</p>
                  <div className="flex gap-2 mt-3">
                    <Link to={`/courses/${e.courseId}`} className="btn-secondary text-xs"><BookOpen size={12}/> Ver curso</Link>
                    {e.status === "APPROVED" && (
                      <Link to={`/course-chat/${e.courseId}`} className="btn-primary text-xs"><MessagesSquare size={12}/> Chat</Link>
                    )}
                  </div>
                </div>
              </div>
            );
          }) : <p className="text-slate-500">Ainda não te inscreveste em nenhum curso.</p>}
        </div>
      )}
    </div>
  );
}
