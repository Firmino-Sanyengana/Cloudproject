import { NavLink, Outlet } from "react-router-dom";
import { LayoutDashboard, Users, BookOpen, ListOrdered, Inbox, MessageSquare } from "lucide-react";

export default function AdminLayout() {
  const linkCls = ({ isActive }) =>
    `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${
      isActive
        ? "bg-brand-600 text-white"
        : "hover:bg-slate-100 dark:hover:bg-slate-800"
    }`;
  return (
    <div className="grid lg:grid-cols-[240px_1fr] gap-6">
      <aside className="space-y-1">
        <h2 className="font-bold mb-3">Administração</h2>
        <NavLink end to="/admin" className={linkCls}><LayoutDashboard size={16}/> Dashboard</NavLink>
        <NavLink to="/admin/enrollments" className={linkCls}><Inbox size={16}/> Inscrições</NavLink>
        <NavLink to="/admin/courses" className={linkCls}><BookOpen size={16}/> Cursos</NavLink>
        <NavLink to="/admin/lessons" className={linkCls}><ListOrdered size={16}/> Lições e Quizzes</NavLink>
        <NavLink to="/admin/users" className={linkCls}><Users size={16}/> Utilizadores</NavLink>
        <NavLink to="/admin/messages" className={linkCls}><MessageSquare size={16}/> Mensagens</NavLink>
      </aside>
      <div><Outlet /></div>
    </div>
  );
}
