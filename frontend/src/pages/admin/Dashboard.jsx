import { useQuery } from "@tanstack/react-query";
import { api } from "@/api/client";
import Skeleton from "@/components/ui/Skeleton";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
  PieChart, Pie, Cell, LineChart, Line,
} from "recharts";
import { Users, BookOpen, GraduationCap, Inbox, ClipboardList, MessageSquare } from "lucide-react";

const COLORS = ["#0ea5e9", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"];

function StatCard({ icon: Icon, label, value, accent }) {
  return (
    <div className="card p-4 flex items-center gap-3">
      <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${accent || "bg-brand-100 text-brand-700"}`}>
        <Icon size={18} />
      </div>
      <div>
        <p className="text-xs text-slate-500">{label}</p>
        <p className="text-xl font-bold">{value}</p>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => (await api.get("/stats/overview")).data,
    refetchInterval: 60_000,
  });

  if (isLoading || !data) return <Skeleton className="h-80" />;
  const t = data.totals;

  const pieData = [
    { name: "Aprovadas", value: t.approved },
    { name: "Pendentes", value: t.pending },
    { name: "Rejeitadas", value: t.rejected },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Alunos" value={t.students} accent="bg-sky-100 text-sky-700" />
        <StatCard icon={GraduationCap} label="Administradores" value={t.admins} accent="bg-violet-100 text-violet-700" />
        <StatCard icon={BookOpen} label="Cursos" value={t.courses} accent="bg-emerald-100 text-emerald-700" />
        <StatCard icon={ClipboardList} label="Lições" value={t.lessons} accent="bg-amber-100 text-amber-700" />
        <StatCard icon={Inbox} label="Inscrições" value={t.enrollments} accent="bg-brand-100 text-brand-700" />
        <StatCard icon={Inbox} label="Pendentes" value={t.pending} accent="bg-amber-100 text-amber-700" />
        <StatCard icon={ClipboardList} label="Quizzes" value={t.quizzes} accent="bg-rose-100 text-rose-700" />
        <StatCard icon={MessageSquare} label="Notificações" value={t.notifications} accent="bg-slate-200 text-slate-700" />
      </section>

      <section className="grid lg:grid-cols-2 gap-6">
        <div className="card p-4">
          <h3 className="font-semibold mb-3">Inscrições por curso</h3>
          <div className="h-72">
            <ResponsiveContainer>
              <BarChart data={data.enrollmentsByCourse}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="course" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Bar dataKey="approved" name="Aprovadas" stackId="a" fill="#22c55e" />
                <Bar dataKey="pending" name="Pendentes" stackId="a" fill="#f59e0b" />
                <Bar dataKey="rejected" name="Rejeitadas" stackId="a" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-4">
          <h3 className="font-semibold mb-3">Distribuição de inscrições</h3>
          <div className="h-72">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
                  {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-4 lg:col-span-2">
          <h3 className="font-semibold mb-3">Novas inscrições (últimos 14 dias)</h3>
          <div className="h-64">
            <ResponsiveContainer>
              <LineChart data={data.enrollmentsByDay}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Line type="monotone" dataKey="count" name="Inscrições" stroke="#0ea5e9" strokeWidth={2} dot />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>
    </div>
  );
}
