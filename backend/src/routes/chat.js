import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { authRequired } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";

const router = Router();

async function canAccess(userId, role, courseId) {
  if (role === "ADMIN") return true;
  const e = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId, courseId } },
  });
  return !!(e && e.status === "APPROVED");
}

/**
 * @openapi
 * /api/chat/{courseId}:
 *   get:
 *     tags: [Chat]
 *     summary: Mensagens do chat de um curso (alunos aprovados ou admin)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Últimas 200 mensagens em ordem cronológica
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:        { type: integer }
 *                   message:   { type: string }
 *                   createdAt: { type: string, format: date-time }
 *                   user:
 *                     type: object
 *                     properties:
 *                       id:   { type: integer }
 *                       name: { type: string }
 *                       role: { type: string }
 *       403: { description: Apenas alunos aprovados podem ver o chat }
 */
router.get("/:courseId", authRequired, async (req, res) => {
  const courseId = Number(req.params.courseId);
  if (!(await canAccess(req.user.id, req.user.role, courseId)))
    return res.status(403).json({ message: "Apenas alunos aprovados podem ver o chat" });
  const msgs = await prisma.chatMessage.findMany({
    where: { courseId },
    orderBy: { createdAt: "asc" },
    take: 200,
    include: { user: { select: { id: true, name: true, role: true } } },
  });
  res.json(msgs);
});

/**
 * @openapi
 * /api/chat/{courseId}:
 *   post:
 *     tags: [Chat]
 *     summary: Enviar mensagem no chat do curso
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [message]
 *             properties:
 *               message: { type: string, minLength: 1, maxLength: 1000 }
 *     responses:
 *       201:
 *         description: Mensagem criada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:        { type: integer }
 *                 message:   { type: string }
 *                 createdAt: { type: string, format: date-time }
 *                 user:      { type: object }
 *       403: { description: Sem acesso ao chat }
 */
router.post(
  "/:courseId",
  authRequired,
  validate(z.object({ message: z.string().min(1).max(1000) })),
  async (req, res) => {
    const courseId = Number(req.params.courseId);
    if (!(await canAccess(req.user.id, req.user.role, courseId)))
      return res.status(403).json({ message: "Sem acesso ao chat" });
    const m = await prisma.chatMessage.create({
      data: { courseId, userId: req.user.id, message: req.body.message },
      include: { user: { select: { id: true, name: true, role: true } } },
    });
    res.status(201).json(m);
  }
);

export default router;
