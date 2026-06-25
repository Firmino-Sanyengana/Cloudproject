import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { authRequired, adminOnly } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";
import { sendMail } from "../lib/mailer.js";

const router = Router();

/**
 * @openapi
 * /api/admin-messages/search-students:
 *   get:
 *     tags: [AdminMessages]
 *     summary: Pesquisar alunos por nome ou email (admin)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: q
 *         required: false
 *         schema: { type: string }
 *         description: Termo de pesquisa (nome ou email)
 *     responses:
 *       200:
 *         description: Lista de até 30 alunos correspondentes
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:        { type: integer }
 *                   name:      { type: string }
 *                   email:     { type: string }
 *                   createdAt: { type: string, format: date-time }
 *       403: { description: Apenas administradores }
 */
router.get("/search-students", authRequired, adminOnly, async (req, res) => {
  const q = (req.query.q || "").toString().trim();
  const where = q
    ? { role: "STUDENT", OR: [{ name: { contains: q } }, { email: { contains: q } }] }
    : { role: "STUDENT" };
  const list = await prisma.user.findMany({
    where,
    select: { id: true, name: true, email: true, createdAt: true },
    take: 30,
    orderBy: { createdAt: "desc" },
  });
  res.json(list);
});

/**
 * @openapi
 * /api/admin-messages:
 *   post:
 *     tags: [AdminMessages]
 *     summary: Enviar mensagem/notificação a um aluno — cria notificação e tenta enviar email (admin)
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [toId, subject, body]
 *             properties:
 *               toId:      { type: integer, description: "ID do aluno destinatário" }
 *               subject:   { type: string, minLength: 2, maxLength: 200 }
 *               body:      { type: string, minLength: 2, maxLength: 2000 }
 *               sendEmail: { type: boolean, default: true, description: "Se true tenta enviar email via SMTP" }
 *     responses:
 *       201:
 *         description: Mensagem criada e notificação gerada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:        { type: integer }
 *                 fromId:    { type: integer }
 *                 toId:      { type: integer }
 *                 subject:   { type: string }
 *                 body:      { type: string }
 *                 createdAt: { type: string, format: date-time }
 *       403: { description: Apenas administradores }
 *       404: { description: Aluno não encontrado }
 */
router.post(
  "/",
  authRequired,
  adminOnly,
  validate(
    z.object({
      toId:      z.number().int(),
      subject:   z.string().min(2).max(200),
      body:      z.string().min(2).max(2000),
      sendEmail: z.boolean().optional().default(true),
    })
  ),
  async (req, res) => {
    const { toId, subject, body, sendEmail: shouldEmail } = req.body;
    const to = await prisma.user.findUnique({ where: { id: toId } });
    if (!to) return res.status(404).json({ message: "Aluno não encontrado" });
    const msg = await prisma.adminMessage.create({
      data: { fromId: req.user.id, toId, subject, body },
    });
    await prisma.notification.create({
      data: { userId: toId, title: subject, body },
    });
    if (shouldEmail) {
      try {
        await sendMail({ to: to.email, subject: `[Sofulano] ${subject}`, text: body });
      } catch (e) {
        console.warn("Falha email:", e.message);
      }
    }
    res.status(201).json(msg);
  }
);

/**
 * @openapi
 * /api/admin-messages/sent:
 *   get:
 *     tags: [AdminMessages]
 *     summary: Mensagens enviadas pelo admin autenticado (últimas 100)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Lista de mensagens enviadas com dados do destinatário
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:        { type: integer }
 *                   subject:   { type: string }
 *                   body:      { type: string }
 *                   createdAt: { type: string, format: date-time }
 *                   to:
 *                     type: object
 *                     properties:
 *                       id:    { type: integer }
 *                       name:  { type: string }
 *                       email: { type: string }
 *       403: { description: Apenas administradores }
 */
router.get("/sent", authRequired, adminOnly, async (req, res) => {
  res.json(
    await prisma.adminMessage.findMany({
      where: { fromId: req.user.id },
      include: { to: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: "desc" },
      take: 100,
    })
  );
});

export default router;
