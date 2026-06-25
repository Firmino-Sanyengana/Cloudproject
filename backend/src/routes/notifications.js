import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { authRequired } from "../middlewares/auth.js";

const router = Router();

/**
 * @openapi
 * /api/notifications:
 *   get:
 *     tags: [Notifications]
 *     summary: Lista de notificações do utilizador autenticado (últimas 100)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Array de notificações ordenadas da mais recente para a mais antiga
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:        { type: integer }
 *                   title:     { type: string }
 *                   body:      { type: string }
 *                   read:      { type: boolean }
 *                   createdAt: { type: string, format: date-time }
 */
router.get("/", authRequired, async (req, res) => {
  res.json(
    await prisma.notification.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: "desc" },
      take: 100,
    })
  );
});

/**
 * @openapi
 * /api/notifications/{id}/read:
 *   patch:
 *     tags: [Notifications]
 *     summary: Marcar notificação como lida
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Notificação marcada como lida }
 */
router.patch("/:id/read", authRequired, async (req, res) => {
  await prisma.notification.updateMany({
    where: { id: Number(req.params.id), userId: req.user.id },
    data: { read: true },
  });
  res.json({ ok: true });
});

/**
 * @openapi
 * /api/notifications/read-all:
 *   patch:
 *     tags: [Notifications]
 *     summary: Marcar todas as notificações como lidas
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Todas as notificações marcadas como lidas }
 */
router.patch("/read-all", authRequired, async (req, res) => {
  await prisma.notification.updateMany({ where: { userId: req.user.id }, data: { read: true } });
  res.json({ ok: true });
});

/**
 * @openapi
 * /api/notifications/{id}:
 *   delete:
 *     tags: [Notifications]
 *     summary: Eliminar notificação
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Notificação eliminada }
 */
router.delete("/:id", authRequired, async (req, res) => {
  await prisma.notification.deleteMany({ where: { id: Number(req.params.id), userId: req.user.id } });
  res.json({ ok: true });
});

export default router;
