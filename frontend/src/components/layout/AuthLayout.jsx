import { Link, Outlet, useNavigate } from "react-router-dom";
import { ArrowLeft, GraduationCap } from "lucide-react";
import { motion } from "framer-motion";

export default function AuthLayout() {
  const nav = useNavigate();
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-white to-brand-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900">
      <div className="absolute top-4 left-4">
        <button onClick={() => nav("/")} className="btn-ghost text-slate-700 dark:text-slate-200">
          <ArrowLeft size={16} /> Voltar
        </button>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-10">
        <Link to="/" className="flex items-center gap-2 mb-6 text-brand-700 dark:text-brand-300">
          <GraduationCap />
          <span className="font-bold text-xl">Sofulano Ukulondja</span>
        </Link>
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <Outlet />
        </motion.div>
      </div>
    </div>
  );
}
