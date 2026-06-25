import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { authRequired, adminOnly } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";

const router = Router();

/**
 * @openapi
 * /api/lessons/by-course/{courseId}:
 *   get:
 *     tags: [Lessons]
 *     summary: Lista lições de um curso com contagem de exercícios e quizzes (admin)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Array de lições ordenadas
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:      { type: integer }
 *                   title:   { type: string }
 *                   order:   { type: integer }
 *                   _count:
 *                     type: object
 *                     properties:
 *                       exercises: { type: integer }
 *                       quizzes:   { type: integer }
 *       403: { description: Apenas administradores }
 */
router.get("/by-course/:courseId", authRequired, adminOnly, async (req, res) => {
  const list = await prisma.lesson.findMany({
    where: { courseId: Number(req.params.courseId) },
    orderBy: { order: "asc" },
    include: { _count: { select: { exercises: true, quizzes: true } } },
  });
  res.json(list);
});

/**
 * @openapi
 * /api/lessons/{id}:
 *   get:
 *     tags: [Lessons]
 *     summary: Detalhes de uma lição com exercícios e quizzes (aluno aprovado ou admin)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Lição com exercícios, quizzes e dados do curso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:        { type: integer }
 *                 title:     { type: string }
 *                 content:   { type: string }
 *                 order:     { type: integer }
 *                 exercises: { type: array, items: { type: object } }
 *                 quizzes:   { type: array, items: { type: object } }
 *                 course:    { type: object }
 *       403: { description: Inscrição não aprovada }
 *       404: { description: Lição não encontrada }
 */
router.get("/:id", authRequired, async (req, res) => {
  const id = Number(req.params.id);
  const lesson = await prisma.lesson.findUnique({
    where: { id },
    include: { exercises: true, quizzes: true, course: true },
  });
  if (!lesson) return res.status(404).json({ message: "Lição não encontrada" });
  if (req.user.role !== "ADMIN") {
    const enr = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId: req.user.id, courseId: lesson.courseId } },
    });
    if (!enr || enr.status !== "APPROVED")
      return res.status(403).json({ message: "Inscrição ainda não aprovada para este curso" });
  }
  res.json(lesson);
});

const lessonSchema = z.object({
  courseId: z.number().int(),
  title:    z.string().min(2).max(120),
  content:  z.string().min(2),
  order:    z.number().int().default(0),
});

/**
 * @openapi
 * /api/lessons:
 *   post:
 *     tags: [Lessons]
 *     summary: Criar nova lição (admin)
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [courseId, title, content]
 *             properties:
 *               courseId: { type: integer }
 *               title:    { type: string, minLength: 2, maxLength: 120 }
 *               content:  { type: string, minLength: 2 }
 *               order:    { type: integer, default: 0 }
 *     responses:
 *       201: { description: Lição criada }
 *       403: { description: Apenas administradores }
 */
router.post("/", authRequired, adminOnly, validate(lessonSchema), async (req, res) => {
  const l = await prisma.lesson.create({ data: req.body });
  res.status(201).json(l);
});

/**
 * @openapi
 * /api/lessons/{id}:
 *   put:
 *     tags: [Lessons]
 *     summary: Actualizar lição (admin)
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
 *             required: [courseId, title, content]
 *             properties:
 *               courseId: { type: integer }
 *               title:    { type: string }
 *               content:  { type: string }
 *               order:    { type: integer }
 *     responses:
 *       200: { description: Lição actualizada }
 *       403: { description: Apenas administradores }
 */
router.put("/:id", authRequired, adminOnly, validate(lessonSchema), async (req, res) => {
  const l = await prisma.lesson.update({ where: { id: Number(req.params.id) }, data: req.body });
  res.json(l);
});

/**
 * @openapi
 * /api/lessons/{id}:
 *   delete:
 *     tags: [Lessons]
 *     summary: Eliminar lição (admin)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Lição eliminada }
 *       403: { description: Apenas administradores }
 */
router.delete("/:id", authRequired, adminOnly, async (req, res) => {
  await prisma.lesson.delete({ where: { id: Number(req.params.id) } });
  res.json({ ok: true });
});

/**
 * @openapi
 * /api/lessons/{id}/complete:
 *   post:
 *     tags: [Lessons]
 *     summary: Marcar lição como concluída (aluno)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Registo de progresso criado ou actualizado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 userId:    { type: integer }
 *                 lessonId:  { type: integer }
 *                 completed: { type: boolean }
 */
router.post("/:id/complete", authRequired, async (req, res) => {
  const lessonId = Number(req.params.id);
  const p = await prisma.progress.upsert({
    where: { userId_lessonId: { userId: req.user.id, lessonId } },
    update: { completed: true },
    create: { userId: req.user.id, lessonId, completed: true },
  });
  res.json(p);
});

export default router;
