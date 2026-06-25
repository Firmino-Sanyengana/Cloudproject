import { motion } from "framer-motion";
import { GraduationCap } from "lucide-react";

export default function Splash() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-brand-600 via-brand-700 to-slate-900 text-white">
      <motion.div
        initial={{ opacity: 0, scale: 0.7 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="text-center px-6"
      >
        <div className="mx-auto h-24 w-24 rounded-3xl bg-white/10 backdrop-blur flex items-center justify-center shadow-2xl">
          <GraduationCap size={56} className="text-white" />
        </div>
        <h1 className="mt-6 text-4xl sm:text-5xl font-extrabold tracking-tight">
          Sofulano Ukulondja
        </h1>
        <p className="mt-3 text-white/80 text-lg">Plataforma de aprendizagem de línguas</p>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: "100%" }}
          transition={{ duration: 1.4, ease: "easeInOut" }}
          className="mt-8 mx-auto h-1 max-w-xs bg-white/60 rounded-full"
        />
      </motion.div>
    </div>
  );
}
