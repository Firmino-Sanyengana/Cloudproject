import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { authRequired, adminOnly } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";

const router = Router();

/**
 * @openapi
 * /api/courses:
 *   get:
 *     tags: [Courses]
 *     summary: Lista todos os cursos (público)
 *     responses:
 *       200:
 *         description: Array de cursos com contagem de lições e inscrições
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:          { type: integer }
 *                   title:       { type: string }
 *                   description: { type: string }
 *                   level:       { type: string, enum: [BEGINNER, INTERMEDIATE, ADVANCED] }
 *                   language:    { type: string }
 *                   cover:       { type: string, nullable: true }
 *                   createdAt:   { type: string, format: date-time }
 *                   _count:
 *                     type: object
 *                     properties:
 *                       lessons:     { type: integer }
 *                       enrollments: { type: integer }
 */
router.get("/", async (_req, res) => {
  const courses = await prisma.course.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { lessons: true, enrollments: true } } },
  });
  res.json(courses);
});

/**
 * @openapi
 * /api/courses/{id}:
 *   get:
 *     tags: [Courses]
 *     summary: Detalhes de um curso com as suas lições
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Curso com array de lições ordenadas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:          { type: integer }
 *                 title:       { type: string }
 *                 description: { type: string }
 *                 level:       { type: string }
 *                 language:    { type: string }
 *                 cover:       { type: string, nullable: true }
 *                 lessons:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:    { type: integer }
 *                       title: { type: string }
 *                       order: { type: integer }
 *       404: { description: Curso não encontrado }
 */
router.get("/:id", async (req, res) => {
  const course = await prisma.course.findUnique({
    where: { id: Number(req.params.id) },
    include: { lessons: { orderBy: { order: "asc" } } },
  });
  if (!course) return res.status(404).json({ message: "Curso não encontrado" });
  res.json(course);
});

const courseSchema = z.object({
  title:       z.string().min(2).max(120),
  description: z.string().min(2).max(2000),
  level:       z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]),
  language:    z.string().min(2).max(10),
  cover:       z.string().max(500).optional().nullable(),
});

/**
 * @openapi
 * /api/courses:
 *   post:
 *     tags: [Courses]
 *     summary: Criar novo curso (admin)
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, description, level, language]
 *             properties:
 *               title:       { type: string, minLength: 2, maxLength: 120 }
 *               description: { type: string, minLength: 2, maxLength: 2000 }
 *               level:       { type: string, enum: [BEGINNER, INTERMEDIATE, ADVANCED] }
 *               language:    { type: string, example: pt }
 *               cover:       { type: string, description: "Caminho relativo ou URL da imagem de capa", nullable: true }
 *     responses:
 *       201: { description: Curso criado }
 *       403: { description: Apenas administradores }
 */
router.post("/", authRequired, adminOnly, validate(courseSchema), async (req, res) => {
  const c = await prisma.course.create({ data: req.body });
  res.status(201).json(c);
});

/**
 * @openapi
 * /api/courses/{id}:
 *   put:
 *     tags: [Courses]
 *     summary: Actualizar curso (admin)
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
 *             required: [title, description, level, language]
 *             properties:
 *               title:       { type: string }
 *               description: { type: string }
 *               level:       { type: string, enum: [BEGINNER, INTERMEDIATE, ADVANCED] }
 *               language:    { type: string }
 *               cover:       { type: string, nullable: true }
 *     responses:
 *       200: { description: Curso actualizado }
 *       403: { description: Apenas administradores }
 *       404: { description: Curso não encontrado }
 */
router.put("/:id", authRequired, adminOnly, validate(courseSchema), async (req, res) => {
  const c = await prisma.course.update({ where: { id: Number(req.params.id) }, data: req.body });
  res.json(c);
});

/**
 * @openapi
 * /api/courses/{id}:
 *   delete:
 *     tags: [Courses]
 *     summary: Eliminar curso (admin)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Curso eliminado }
 *       403: { description: Apenas administradores }
 */
router.delete("/:id", authRequired, adminOnly, async (req, res) => {
  await prisma.course.delete({ where: { id: Number(req.params.id) } });
  res.json({ ok: true });
});

export default router;
