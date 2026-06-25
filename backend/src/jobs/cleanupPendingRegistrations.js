import cron from "node-cron";
import { prisma } from "../lib/prisma.js";

export async function cleanupExpiredPendingRegistrations() {
  const { count } = await prisma.pendingRegistration.deleteMany({
    where: { verificationTokenExpiresAt: { lt: new Date() } },
  });
  if (count > 0) {
    console.log(`[cleanup] ${count} registo(s) pendente(s) expirado(s) removido(s).`);
  }
  return count;
}

export function startCleanupJob() {
  // Roda a cada hora, no minuto 0 (ex: 14:00, 15:00, ...)
  cron.schedule("0 * * * *", () => {
    cleanupExpiredPendingRegistrations().catch((err) =>
      console.error("[cleanup] erro ao limpar registos pendentes:", err)
    );
  });

  // Roda também uma vez ao iniciar o servidor, para limpar pendências antigas já existentes
  cleanupExpiredPendingRegistrations().catch((err) =>
    console.error("[cleanup] erro ao limpar registos pendentes (inicial):", err)
  );
}