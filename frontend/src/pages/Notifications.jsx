import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/api/client";
import { Bell, Check, Trash2 } from "lucide-react";
import { toast } from "sonner";
import Skeleton from "@/components/ui/Skeleton";

export default function Notifications() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => (await api.get("/notifications")).data,
  });

  const readAll = useMutation({
    mutationFn: () => api.patch("/notifications/read-all"),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["notifications"] }); qc.invalidateQueries({ queryKey: ["notif-count"] }); toast.success("Tudo marcado como lido"); },
  });
  const markOne = useMutation({
    mutationFn: (id) => api.patch(`/notifications/${id}/read`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["notifications"] }); qc.invalidateQueries({ queryKey: ["notif-count"] }); },
  });
  const del = useMutation({
    mutationFn: (id) => api.delete(`/notifications/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["notifications"] }); qc.invalidateQueries({ queryKey: ["notif-count"] }); },
  });

  if (isLoading) return <Skeleton className="h-40" />;

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2"><Bell /> Notificações</h1>
        <button className="btn-secondary" onClick={() => readAll.mutate()}>
          <Check size={16}/> Marcar todas como lidas
        </button>
      </div>
      {(!data || data.length === 0) && <p className="text-slate-500">Sem notificações.</p>}
      <div className="space-y-2">
        {data?.map((n) => (
          <div key={n.id} className={`card p-4 flex items-start gap-3 ${n.read ? "opacity-60" : ""}`}>
            <div className="flex-1">
              <h3 className="font-semibold">{n.title}</h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-wrap">{n.body}</p>
              <p className="text-xs text-slate-400 mt-1">{new Date(n.createdAt).toLocaleString()}</p>
            </div>
            {!n.read && (
              <button className="btn-ghost" onClick={() => markOne.mutate(n.id)} title="Marcar como lida">
                <Check size={16}/>
              </button>
            )}
            <button className="btn-ghost text-red-600" onClick={() => del.mutate(n.id)} title="Apagar">
              <Trash2 size={16}/>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
