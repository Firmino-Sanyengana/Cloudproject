import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/api/client";
import { useState, useEffect, useRef } from "react";
import { Send, MessagesSquare, Shield } from "lucide-react";
import { useAuthStore } from "@/store/auth";

export default function CourseChat() {
  const { courseId } = useParams();
  const qc = useQueryClient();
  const me = useAuthStore((s) => s.user);
  const [text, setText] = useState("");
  const endRef = useRef(null);

  const { data: messages = [], isLoading, error } = useQuery({
    queryKey: ["chat", courseId],
    queryFn: async () => (await api.get(`/chat/${courseId}`)).data,
    refetchInterval: 4000,
  });
  const { data: course } = useQuery({
    queryKey: ["course", courseId],
    queryFn: async () => (await api.get(`/courses/${courseId}`)).data,
  });

  const send = useMutation({
    mutationFn: () => api.post(`/chat/${courseId}`, { message: text }),
    onSuccess: () => { setText(""); qc.invalidateQueries({ queryKey: ["chat", courseId] }); },
  });

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  if (error) return <p className="text-red-600">{error.response?.data?.message || "Sem acesso ao chat."}</p>;

  return (
    <div className="max-w-3xl mx-auto card flex flex-col h-[70vh]">
      <header className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2">
        <MessagesSquare className="text-brand-600" />
        <div>
          <h1 className="font-semibold">Chat — {course?.title || "Curso"}</h1>
          <p className="text-xs text-slate-500">Conversa com os outros alunos inscritos</p>
        </div>
      </header>
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {isLoading && <p className="text-slate-500 text-sm">A carregar...</p>}
        {messages.map((m) => {
          const mine = m.userId === me?.id;
          return (
            <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm ${mine ? "bg-brand-600 text-white" : "bg-slate-100 dark:bg-slate-800"}`}>
                <p className={`text-xs font-medium mb-0.5 flex items-center gap-1 ${mine ? "text-white/90" : "text-slate-500"}`}>
                  {m.user?.name}
                  {m.user?.role === "ADMIN" && <Shield size={10}/>}
                </p>
                <p className="whitespace-pre-wrap">{m.message}</p>
                <p className={`text-[10px] mt-1 ${mine ? "text-white/70" : "text-slate-400"}`}>
                  {new Date(m.createdAt).toLocaleTimeString()}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={endRef} />
      </div>
      <form
        className="p-3 border-t border-slate-200 dark:border-slate-800 flex gap-2"
        onSubmit={(e) => { e.preventDefault(); if (text.trim()) send.mutate(); }}
      >
        <input className="input flex-1" placeholder="Escreve uma mensagem..."
          value={text} onChange={(e) => setText(e.target.value)} />
        <button className="btn-primary" disabled={!text.trim() || send.isPending}>
          <Send size={16} />
        </button>
      </form>
    </div>
  );
}
