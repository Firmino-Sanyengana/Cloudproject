import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { authRequired, adminOnly } from "../middlewares/auth.js";

const router = Router();

/**
 * @openapi
 * /api/enrollments/{courseId}:
 *   post:
 *     tags: [Enrollments]
 *     summary: Inscrever-se num curso (aluno)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       201: { description: Inscrição criada com estado PENDING }
 *       404: { description: Curso não encontrado }
 *       409: { description: Já inscrito neste curso }
 */
router.post("/:courseId", authRequired, async (req, res) => {
  const courseId = Number(req.params.courseId);
  const course = await prisma.course.findUnique({ where: { id: courseId } });
  if (!course) return res.status(404).json({ message: "Curso não encontrado" });
  try {
    const e = await prisma.enrollment.create({
      data: { userId: req.user.id, courseId, status: "PENDING" },
    });
    res.status(201).json(e);
  } catch {
    return res.status(409).json({ message: "Você já se inscreveu neste curso" });
  }
});

/**
 * @openapi
 * /api/enrollments/me:
 *   get:
 *     tags: [Enrollments]
 *     summary: As minhas inscrições (aluno)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Lista de inscrições do utilizador autenticado
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:       { type: integer }
 *                   status:   { type: string, enum: [PENDING, APPROVED, REJECTED] }
 *                   course:   { type: object }
 *                   createdAt: { type: string, format: date-time }
 */
router.get("/me", authRequired, async (req, res) => {
  const list = await prisma.enrollment.findMany({
    where: { userId: req.user.id },
    include: { course: true },
    orderBy: { createdAt: "desc" },
  });
  res.json(list);
});

/**
 * @openapi
 * /api/enrollments:
 *   get:
 *     tags: [Enrollments]
 *     summary: Todas as inscrições (admin)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Lista completa com dados de utilizador e curso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:     { type: integer }
 *                   status: { type: string, enum: [PENDING, APPROVED, REJECTED] }
 *                   user:   { type: object, properties: { id: { type: integer }, name: { type: string }, email: { type: string } } }
 *                   course: { type: object }
 *       403: { description: Apenas administradores }
 */
router.get("/", authRequired, adminOnly, async (req, res) => {
  const list = await prisma.enrollment.findMany({
    include: { user: { select: { id: true, name: true, email: true } }, course: true },
    orderBy: { createdAt: "desc" },
  });
  res.json(list);
});

/**
 * @openapi
 * /api/enrollments/{id}/approve:
 *   patch:
 *     tags: [Enrollments]
 *     summary: Aprovar inscrição (admin)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Inscrição aprovada }
 *       403: { description: Apenas administradores }
 */
router.patch("/:id/approve", authRequired, adminOnly, async (req, res) => {
  const e = await prisma.enrollment.update({ where: { id: Number(req.params.id) }, data: { status: "APPROVED" } });
  res.json(e);
});

/**
 * @openapi
 * /api/enrollments/{id}/reject:
 *   patch:
 *     tags: [Enrollments]
 *     summary: Rejeitar inscrição (admin)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Inscrição rejeitada }
 *       403: { description: Apenas administradores }
 */
router.patch("/:id/reject", authRequired, adminOnly, async (req, res) => {
  const e = await prisma.enrollment.update({ where: { id: Number(req.params.id) }, data: { status: "REJECTED" } });
  res.json(e);
});

export default router;
