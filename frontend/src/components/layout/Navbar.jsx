import { Link, NavLink } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/store/auth";
import { useThemeStore } from "@/store/theme";
import { api } from "@/api/client";
import { LogOut, Moon, Sun, GraduationCap, Menu, X, Bell } from "lucide-react";
import { useState } from "react";

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const { theme, toggle } = useThemeStore();
  const [open, setOpen] = useState(false);

  const { data: notifs } = useQuery({
    queryKey: ["notif-count"],
    queryFn: async () => (await api.get("/notifications")).data,
    enabled: !!user,
    refetchInterval: 30000,
  });
  const unread = (notifs || []).filter((n) => !n.read).length;

  const links = [
    { to: "/", label: "Início" },
    { to: "/courses", label: "Cursos" },
    { to: "/translator", label: "Tradutor", auth: true },
    { to: "/my-courses", label: "Meus cursos", auth: true },
    { to: "/exercise-history", label: "Histórico", auth: true },
    { to: "/progress", label: "Progresso", auth: true },
    { to: "/admin", label: "Administração", admin: true },
  ].filter((l) => (l.admin ? user?.role === "ADMIN" : l.auth ? !!user : true));

  return (
    <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur border-b border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-bold text-lg">
          <GraduationCap className="text-brand-600" />
          <span className="hidden sm:inline">Sofulano Ukulondja</span>
          <span className="sm:hidden">Sofulano</span>
        </Link>
        <nav className="hidden lg:flex items-center gap-1">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end
              className={({ isActive }) =>
                `px-3 py-2 rounded-lg text-sm font-medium ${
                  isActive
                    ? "bg-brand-50 text-brand-700 dark:bg-slate-800 dark:text-brand-300"
                    : "hover:bg-slate-100 dark:hover:bg-slate-800"
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          {user && (
            <Link to="/notifications" className="relative btn-ghost h-9 w-9 p-0" aria-label="Notificações">
              <Bell size={16} />
              {unread > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] rounded-full h-4 min-w-4 px-1 flex items-center justify-center">
                  {unread}
                </span>
              )}
            </Link>
          )}
          <button onClick={toggle} aria-label="Alternar tema" className="btn-ghost h-9 w-9 p-0">
            {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          {user ? (
            <>
              <Link to="/profile" className="hidden sm:block text-sm font-medium hover:underline">
                {user.name}
              </Link>
              <button onClick={logout} className="btn-secondary" aria-label="Sair">
                <LogOut size={16} />
                <span className="hidden sm:inline">Sair</span>
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-secondary">Entrar</Link>
              <Link to="/register" className="btn-primary">Criar conta</Link>
            </>
          )}
          <button className="lg:hidden btn-ghost h-9 w-9 p-0" onClick={() => setOpen(!open)} aria-label="Menu">
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>
      {open && (
        <nav className="lg:hidden border-t border-slate-200 dark:border-slate-800 p-2 space-y-1">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `block px-3 py-2 rounded-lg text-sm font-medium ${
                  isActive
                    ? "bg-brand-50 text-brand-700 dark:bg-slate-800"
                    : "hover:bg-slate-100 dark:hover:bg-slate-800"
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>
      )}
    </header>
  );
}
