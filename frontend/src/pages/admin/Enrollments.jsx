import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/api/client";
import Skeleton from "@/components/ui/Skeleton";
import Badge from "@/components/ui/Badge";
import { toast } from "sonner";
import { Check, X } from "lucide-react";

export default function Enrollments() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["all-enr"], queryFn: async () => (await api.get("/enrollments")).data });
  const act = useMutation({
    mutationFn: ({ id, action }) => api.patch(`/enrollments/${id}/${action}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["all-enr"] }); toast.success("Atualizado"); },
  });
  if (isLoading) return <Skeleton className="h-40" />;
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Inscrições</h1>
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 dark:bg-slate-800 text-left">
            <tr><th className="p-3">Aluno</th><th className="p-3">Curso</th><th className="p-3">Status</th><th className="p-3">Data</th><th className="p-3 text-right">Ações</th></tr>
          </thead>
          <tbody>
            {data?.map((e) => (
              <tr key={e.id} className="border-t border-slate-200 dark:border-slate-800">
                <td className="p-3">{e.user.name}<div className="text-xs text-slate-500">{e.user.email}</div></td>
                <td className="p-3">{e.course.title}</td>
                <td className="p-3"><Badge kind={e.status} /></td>
                <td className="p-3 text-xs text-slate-500">{new Date(e.createdAt).toLocaleDateString()}</td>
                <td className="p-3 text-right space-x-2">
                  {e.status === "PENDING" && (
                    <>
                      <button className="btn-primary" onClick={() => act.mutate({ id: e.id, action: "approve" })}><Check size={14} />Aprovar</button>
                      <button className="btn-danger" onClick={() => act.mutate({ id: e.id, action: "reject" })}><X size={14} />Rejeitar</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
