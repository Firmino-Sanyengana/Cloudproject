import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/api/client";
import Skeleton from "@/components/ui/Skeleton";
import { toast } from "sonner";

export default function UsersAdmin() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["users"], queryFn: async () => (await api.get("/users")).data });
  const role = useMutation({
    mutationFn: ({ id, role }) => api.patch(`/users/${id}/role`, { role }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["users"] }); toast.success("Perfil atualizado"); },
  });
  if (isLoading) return <Skeleton className="h-40" />;
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Usuários</h1>
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 dark:bg-slate-800 text-left"><tr><th className="p-3">Nome</th><th className="p-3">E-mail</th><th className="p-3">Perfil</th><th className="p-3 text-right">Ações</th></tr></thead>
          <tbody>
            {data?.map((u) => (
              <tr key={u.id} className="border-t border-slate-200 dark:border-slate-800">
                <td className="p-3">{u.name}</td><td className="p-3">{u.email}</td><td className="p-3">{u.role}</td>
                <td className="p-3 text-right">
                  <select className="input max-w-[150px] ml-auto" value={u.role} onChange={(e) => role.mutate({ id: u.id, role: e.target.value })}>
                    <option value="STUDENT">STUDENT</option><option value="ADMIN">ADMIN</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
