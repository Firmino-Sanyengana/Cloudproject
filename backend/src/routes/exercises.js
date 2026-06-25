import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { authRequired, adminOnly } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";

const router = Router();

const schema = z.object({
  lessonId: z.number().int(),
  type:     z.enum(["FILL_BLANK", "SCRAMBLED", "TRANSLATE"]),
  prompt:   z.string().min(2).max(500),
  answer:   z.string().min(1).max(500),
  hint:     z.string().max(200).optional().nullable(),
});

/**
 * @openapi
 * /api/exercises/history/me:
 *   get:
 *     tags: [Exercises]
 *     summary: Histórico de tentativas de exercícios do aluno autenticado
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Lista de tentativas com dados do exercício, lição e curso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:        { type: integer }
 *                   answer:    { type: string }
 *                   correct:   { type: boolean }
 *                   createdAt: { type: string, format: date-time }
 *                   exercise:
 *                     type: object
 *                     properties:
 *                       prompt: { type: string }
 *                       type:   { type: string }
 *                       lesson:
 *                         type: object
 *                         properties:
 *                           title:  { type: string }
 *                           course: { type: object, properties: { id: { type: integer }, title: { type: string } } }
 */
router.get("/history/me", authRequired, async (req, res) => {
  const list = await prisma.exerciseAttempt.findMany({
    where: { userId: req.user.id },
    orderBy: { createdAt: "desc" },
    take: 200,
    include: {
      exercise: {
        include: { lesson: { include: { course: { select: { id: true, title: true } } } } },
      },
    },
  });
  res.json(list);
});

/**
 * @openapi
 * /api/exercises:
 *   post:
 *     tags: [Exercises]
 *     summary: Criar exercício (admin)
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [lessonId, type, prompt, answer]
 *             properties:
 *               lessonId: { type: integer }
 *               type:     { type: string, enum: [FILL_BLANK, SCRAMBLED, TRANSLATE] }
 *               prompt:   { type: string, minLength: 2, maxLength: 500 }
 *               answer:   { type: string, minLength: 1, maxLength: 500 }
 *               hint:     { type: string, maxLength: 200, nullable: true }
 *     responses:
 *       201: { description: Exercício criado }
 *       403: { description: Apenas administradores }
 */
router.post("/", authRequired, adminOnly, validate(schema), async (req, res) => {
  const ex = await prisma.exercise.create({ data: req.body });
  res.status(201).json(ex);
});

/**
 * @openapi
 * /api/exercises/{id}:
 *   put:
 *     tags: [Exercises]
 *     summary: Actualizar exercício (admin)
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
 *               type:     { type: string, enum: [FILL_BLANK, SCRAMBLED, TRANSLATE] }
 *               prompt:   { type: string }
 *               answer:   { type: string }
 *               hint:     { type: string, nullable: true }
 *     responses:
 *       200: { description: Exercício actualizado }
 *       403: { description: Apenas administradores }
 */
router.put("/:id", authRequired, adminOnly, validate(schema), async (req, res) => {
  const ex = await prisma.exercise.update({ where: { id: Number(req.params.id) }, data: req.body });
  res.json(ex);
});

/**
 * @openapi
 * /api/exercises/{id}:
 *   delete:
 *     tags: [Exercises]
 *     summary: Eliminar exercício (admin)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Exercício eliminado }
 *       403: { description: Apenas administradores }
 */
router.delete("/:id", authRequired, adminOnly, async (req, res) => {
  await prisma.exercise.delete({ where: { id: Number(req.params.id) } });
  res.json({ ok: true });
});

/**
 * @openapi
 * /api/exercises/{id}/attempt:
 *   post:
 *     tags: [Exercises]
 *     summary: Submeter tentativa de exercício (aluno)
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
 *               answer: { type: string, minLength: 1, maxLength: 500 }
 *     responses:
 *       200:
 *         description: Resultado da tentativa
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 correct:  { type: boolean }
 *                 expected: { type: string }
 *                 attempt:  { type: object }
 *       404: { description: Exercício não encontrado }
 */
router.post(
  "/:id/attempt",
  authRequired,
  validate(z.object({ answer: z.string().min(1).max(500) })),
  async (req, res) => {
    const exercise = await prisma.exercise.findUnique({ where: { id: Number(req.params.id) } });
    if (!exercise) return res.status(404).json({ message: "Exercício não encontrado" });
    const normalize = (s) => s.trim().toLowerCase().replace(/\s+/g, " ").replace(/[.!?]/g, "");
    const correct = normalize(req.body.answer) === normalize(exercise.answer);
    const att = await prisma.exerciseAttempt.create({
      data: { userId: req.user.id, exerciseId: exercise.id, answer: req.body.answer, correct },
    });
    res.json({ correct, expected: exercise.answer, attempt: att });
  }
);

export default router;
