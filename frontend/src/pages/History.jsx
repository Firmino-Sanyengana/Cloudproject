import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/api/client";
import Skeleton from "@/components/ui/Skeleton";
import { toast } from "sonner";

export default function History() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["hist"], queryFn: async () => (await api.get("/history")).data });
  const clear = useMutation({
    mutationFn: () => api.delete("/history"),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["hist"] }); toast.success("Histórico limpo"); },
  });
  if (isLoading) return <Skeleton className="h-40" />;
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Histórico</h1>
        {data?.length > 0 && <button className="btn-danger" onClick={() => clear.mutate()}>Limpar</button>}
      </div>
      <div className="space-y-2">
        {data?.length ? data.map((h) => (
          <div key={h.id} className="card p-4">
            <p className="text-xs text-slate-500">{new Date(h.createdAt).toLocaleString()} — {h.source} → {h.target}</p>
            <p className="font-medium">{h.text}</p>
            <p className="text-brand-600">{h.translation}</p>
          </div>
        )) : <p className="text-slate-500">Sem histórico.</p>}
      </div>
    </div>
  );
}
