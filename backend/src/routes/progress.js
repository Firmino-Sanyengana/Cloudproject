import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { authRequired } from "../middlewares/auth.js";

const router = Router();

/**
 * @openapi
 * /api/progress/me:
 *   get:
 *     tags: [Progress]
 *     summary: Progresso do aluno em todos os cursos aprovados
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Progresso por curso e estatísticas de quizzes
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 courses:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       course:    { type: object }
 *                       total:     { type: integer, description: "Total de lições" }
 *                       completed: { type: integer, description: "Lições concluídas" }
 *                       pct:       { type: integer, description: "Percentagem de conclusão (0-100)" }
 *                 quizAttempts: { type: integer }
 *                 quizScore:    { type: integer }
 *       401: { description: Token inválido ou ausente }
 */
router.get("/me", authRequired, async (req, res) => {
  const userId = req.user.id;
  const enrollments = await prisma.enrollment.findMany({
    where: { userId, status: "APPROVED" },
    include: {
      course: { include: { lessons: { select: { id: true } } } },
    },
  });
  const result = await Promise.all(enrollments.map(async (e) => {
    const total = e.course.lessons.length;
    const completed = await prisma.progress.count({
      where: { userId, completed: true, lessonId: { in: e.course.lessons.map((l) => l.id) } },
    });
    return { course: e.course, total, completed, pct: total ? Math.round((completed * 100) / total) : 0 };
  }));
  const attempts = await prisma.quizAttempt.findMany({ where: { userId } });
  res.json({ courses: result, quizAttempts: attempts.length, quizScore: attempts.reduce((s, a) => s + a.score, 0) });
});

export default router;
