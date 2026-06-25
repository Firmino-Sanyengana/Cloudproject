import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { authRequired, adminOnly } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";

const router = Router();

const quizSchema = z.object({
  lessonId: z.number().int(),
  question: z.string().min(2),
  options:  z.array(z.string().min(1)).min(2).max(6),
  correct:  z.number().int().min(0),
});

/**
 * @openapi
 * /api/quizzes/by-lesson/{lessonId}:
 *   get:
 *     tags: [Quizzes]
 *     summary: Lista quizzes de uma lição (admin)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: lessonId
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Array de quizzes com opções já parseadas
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:       { type: integer }
 *                   question: { type: string }
 *                   options:  { type: array, items: { type: string } }
 *                   correct:  { type: integer }
 *       403: { description: Apenas administradores }
 */
router.get("/by-lesson/:lessonId", authRequired, adminOnly, async (req, res) => {
  const list = await prisma.quiz.findMany({ where: { lessonId: Number(req.params.lessonId) } });
  res.json(list.map((q) => ({ ...q, options: JSON.parse(q.options) })));
});

/**
 * @openapi
 * /api/quizzes/history/me:
 *   get:
 *     tags: [Quizzes]
 *     summary: Histórico de tentativas de quizzes do aluno autenticado
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Lista de tentativas com dados do quiz, lição e curso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:        { type: integer }
 *                   score:     { type: integer }
 *                   createdAt: { type: string, format: date-time }
 *                   quiz:
 *                     type: object
 *                     properties:
 *                       question: { type: string }
 *                       lesson:
 *                         type: object
 *                         properties:
 *                           title:  { type: string }
 *                           course: { type: object, properties: { id: { type: integer }, title: { type: string } } }
 */
router.get("/history/me", authRequired, async (req, res) => {
  const list = await prisma.quizAttempt.findMany({
    where: { userId: req.user.id },
    orderBy: { createdAt: "desc" },
    take: 200,
    include: {
      quiz: { include: { lesson: { include: { course: { select: { id: true, title: true } } } } } },
    },
  });
  res.json(list);
});

/**
 * @openapi
 * /api/quizzes:
 *   post:
 *     tags: [Quizzes]
 *     summary: Criar quiz (admin)
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [lessonId, question, options, correct]
 *             properties:
 *               lessonId: { type: integer }
 *               question: { type: string, minLength: 2 }
 *               options:  { type: array, items: { type: string }, minItems: 2, maxItems: 6 }
 *               correct:  { type: integer, description: "Índice (0-based) da opção correcta" }
 *     responses:
 *       201: { description: Quiz criado }
 *       403: { description: Apenas administradores }
 */
router.post("/", authRequired, adminOnly, validate(quizSchema), async (req, res) => {
  const { options, ...rest } = req.body;
  const q = await prisma.quiz.create({ data: { ...rest, options: JSON.stringify(options) } });
  res.status(201).json(q);
});

/**
 * @openapi
 * /api/quizzes/{id}:
 *   put:
 *     tags: [Quizzes]
 *     summary: Actualizar quiz (admin)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               lessonId: { type: integer }
 *               question: { type: string }
 *               options:  { type: array, items: { type: string } }
 *               correct:  { type: integer }
 *     responses:
 *       200: { description: Quiz actualizado }
 *       403: { description: Apenas administradores }
 */
router.put("/:id", authRequired, adminOnly, validate(quizSchema), async (req, res) => {
  const { options, ...rest } = req.body;
  const q = await prisma.quiz.update({
    where: { id: Number(req.params.id) },
    data: { ...rest, options: JSON.stringify(options) },
  });
  res.json(q);
});

/**
 * @openapi
 * /api/quizzes/{id}:
 *   delete:
 *     tags: [Quizzes]
 *     summary: Eliminar quiz (admin)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Quiz eliminado }
 *       403: { description: Apenas administradores }
 */
router.delete("/:id", authRequired, adminOnly, async (req, res) => {
  await prisma.quiz.delete({ where: { id: Number(req.params.id) } });
  res.json({ ok: true });
});

/**
 * @openapi
 * /api/quizzes/{id}/attempt:
 *   post:
 *     tags: [Quizzes]
 *     summary: Submeter resposta a um quiz (aluno)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [answer]
 *             properties:
 *               answer: { type: integer, description: "Índice (0-based) da opção escolhida" }
 *     responses:
 *       200:
 *         description: Resultado da tentativa
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 score:   { type: integer, enum: [0, 1] }
 *                 correct: { type: integer }
 *                 attempt: { type: object }
 *       404: { description: Quiz não encontrado }
 */
router.post("/:id/attempt", authRequired, async (req, res) => {
  const id = Number(req.params.id);
  const quiz = await prisma.quiz.findUnique({ where: { id } });
  if (!quiz) return res.status(404).json({ message: "Quiz não encontrado" });
  const { answer } = req.body;
  const score = Number(answer) === quiz.correct ? 1 : 0;
  const a = await prisma.quizAttempt.create({ data: { userId: req.user.id, quizId: id, score } });
  res.json({ score, attempt: a, correct: quiz.correct });
});

export default router;
