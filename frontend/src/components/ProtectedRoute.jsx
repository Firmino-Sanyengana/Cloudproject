import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "@/store/auth";

export default function ProtectedRoute({ children, adminOnly = false }) {
  const { user, token } = useAuthStore();
  const loc = useLocation();
  if (!token || !user) return <Navigate to="/login" state={{ from: loc }} replace />;
  if (adminOnly && user.role !== "ADMIN") return <Navigate to="/" replace />;
  return children;
}
