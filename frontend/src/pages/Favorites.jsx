import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/api/client";
import Skeleton from "@/components/ui/Skeleton";
import { Trash2 } from "lucide-react";

export default function Favorites() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["fav"], queryFn: async () => (await api.get("/favorites")).data });
  const del = useMutation({
    mutationFn: (id) => api.delete(`/favorites/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["fav"] }),
  });
  if (isLoading) return <Skeleton className="h-40" />;
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Favoritos</h1>
      <div className="space-y-3">
        {data?.length ? data.map((f) => (
          <div key={f.id} className="card p-4 flex justify-between items-start">
            <div>
              <p className="text-sm text-slate-500 uppercase">{f.source} → {f.target}</p>
              <p className="font-medium">{f.text}</p>
              <p className="text-brand-600">{f.translation}</p>
            </div>
            <button className="btn-ghost text-red-600" onClick={() => del.mutate(f.id)} aria-label="Remover"><Trash2 size={16} /></button>
          </div>
        )) : <p className="text-slate-500">Nenhum favorito ainda.</p>}
      </div>
    </div>
  );
}
