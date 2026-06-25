import { Link } from "react-router-dom";
export default function NotFound() {
  return (
    <div className="text-center py-20">
      <h1 className="text-7xl font-bold text-brand-600">404</h1>
      <p className="mt-3 text-slate-500">Página não encontrada.</p>
      <Link to="/" className="btn-primary mt-6 inline-flex">Voltar ao início</Link>
    </div>
  );
}
