import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { authRequired } from "../middlewares/auth.js";

const router = Router();

/**
 * @openapi
 * /api/history:
 *   get:
 *     tags: [History]
 *     summary: Histórico de traduções do utilizador autenticado (últimas 100)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Array de entradas de histórico
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:          { type: integer }
 *                   text:        { type: string }
 *                   translation: { type: string }
 *                   source:      { type: string }
 *                   target:      { type: string }
 *                   createdAt:   { type: string, format: date-time }
 */
router.get("/", authRequired, async (req, res) => {
  res.json(await prisma.history.findMany({ where: { userId: req.user.id }, orderBy: { createdAt: "desc" }, take: 100 }));
});

/**
 * @openapi
 * /api/history:
 *   delete:
 *     tags: [History]
 *     summary: Limpar todo o histórico de traduções do utilizador autenticado
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Histórico apagado }
 */
router.delete("/", authRequired, async (req, res) => {
  await prisma.history.deleteMany({ where: { userId: req.user.id } });
  res.json({ ok: true });
});

export default router;
