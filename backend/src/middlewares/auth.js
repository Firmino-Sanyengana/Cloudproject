import { verifyToken } from "../lib/jwt.js";
export function authRequired(req, res, next) {
  const h = req.headers.authorization || "";
  const token = h.startsWith("Bearer ") ? h.slice(7) : null;
  if (!token) return res.status(401).json({ message: "Não autenticado" });
  try { req.user = verifyToken(token); next(); }
  catch { return res.status(401).json({ message: "Token inválido ou expirado" }); }
}
export function adminOnly(req, res, next) {
  if (req.user?.role !== "ADMIN") return res.status(403).json({ message: "Acesso restrito a administradores" });
  next();
}
