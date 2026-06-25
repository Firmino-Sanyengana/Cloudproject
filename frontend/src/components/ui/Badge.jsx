const styles = {
  PENDING: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200",
  APPROVED: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200",
  REJECTED: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200",
  BEGINNER: "bg-sky-100 text-sky-800",
  INTERMEDIATE: "bg-violet-100 text-violet-800",
  ADVANCED: "bg-rose-100 text-rose-800",
};
const labels = { PENDING: "Pendente", APPROVED: "Aprovado", REJECTED: "Rejeitado",
  BEGINNER: "Iniciante", INTERMEDIATE: "Intermédio", ADVANCED: "Avançado" };
export default function Badge({ kind }) {
  return <span className={`badge ${styles[kind] || "bg-slate-200 text-slate-800"}`}>{labels[kind] || kind}</span>;
}
