import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { authRequired, adminOnly } from "../middlewares/auth.js";

const router = Router();

/**
 * @openapi
 * /api/stats/overview:
 *   get:
 *     tags: [Stats]
 *     summary: Estatísticas globais para o dashboard admin
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Totais, inscrições por curso e inscrições por dia (últimos 14 dias)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totals:
 *                   type: object
 *                   properties:
 *                     students:         { type: integer }
 *                     admins:           { type: integer }
 *                     courses:          { type: integer }
 *                     lessons:          { type: integer }
 *                     quizzes:          { type: integer }
 *                     exercises:        { type: integer }
 *                     enrollments:      { type: integer }
 *                     pending:          { type: integer }
 *                     approved:         { type: integer }
 *                     rejected:         { type: integer }
 *                     quizAttempts:     { type: integer }
 *                     exerciseAttempts: { type: integer }
 *                     notifications:    { type: integer }
 *                 enrollmentsByCourse:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       course:   { type: string }
 *                       pending:  { type: integer }
 *                       approved: { type: integer }
 *                       rejected: { type: integer }
 *                 enrollmentsByDay:
 *                   type: array
 *                   description: Inscrições por dia nos últimos 14 dias
 *                   items:
 *                     type: object
 *                     properties:
 *                       date:  { type: string, format: date }
 *                       count: { type: integer }
 *       403: { description: Apenas administradores }
 */
router.get("/overview", authRequired, adminOnly, async (_req, res) => {
  const [
    totalStudents, totalAdmins, totalCourses, totalLessons, totalQuizzes,
    totalExercises, totalEnrollments, pendingEnrollments, approvedEnrollments,
    rejectedEnrollments, totalQuizAttempts, totalExerciseAttempts, totalNotifications,
  ] = await Promise.all([
    prisma.user.count({ where: { role: "STUDENT" } }),
    prisma.user.count({ where: { role: "ADMIN" } }),
    prisma.course.count(),
    prisma.lesson.count(),
    prisma.quiz.count(),
    prisma.exercise.count(),
    prisma.enrollment.count(),
    prisma.enrollment.count({ where: { status: "PENDING" } }),
    prisma.enrollment.count({ where: { status: "APPROVED" } }),
    prisma.enrollment.count({ where: { status: "REJECTED" } }),
    prisma.quizAttempt.count(),
    prisma.exerciseAttempt.count(),
    prisma.notification.count(),
  ]);

  const enrollByCourse = await prisma.enrollment.groupBy({
    by: ["courseId", "status"],
    _count: { _all: true },
  });
  const courses = await prisma.course.findMany({ select: { id: true, title: true } });
  const courseMap = Object.fromEntries(courses.map((c) => [c.id, c.title]));
  const byCourse = {};
  for (const row of enrollByCourse) {
    const key = courseMap[row.courseId] || `#${row.courseId}`;
    byCourse[key] = byCourse[key] || { course: key, pending: 0, approved: 0, rejected: 0 };
    byCourse[key][row.status.toLowerCase()] = row._count._all;
  }

  const since = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
  const recentEnr = await prisma.enrollment.findMany({
    where: { createdAt: { gte: since } },
    select: { createdAt: true },
  });
  const byDay = {};
  for (let i = 13; i >= 0; i--) {
    const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
    const k = d.toISOString().slice(0, 10);
    byDay[k] = 0;
  }
  for (const e of recentEnr) {
    const k = e.createdAt.toISOString().slice(0, 10);
    if (k in byDay) byDay[k]++;
  }

  res.json({
    totals: {
      students: totalStudents,
      admins: totalAdmins,
      courses: totalCourses,
      lessons: totalLessons,
      quizzes: totalQuizzes,
      exercises: totalExercises,
      enrollments: totalEnrollments,
      pending: pendingEnrollments,
      approved: approvedEnrollments,
      rejected: rejectedEnrollments,
      quizAttempts: totalQuizAttempts,
      exerciseAttempts: totalExerciseAttempts,
      notifications: totalNotifications,
    },
    enrollmentsByCourse: Object.values(byCourse),
    enrollmentsByDay: Object.entries(byDay).map(([date, count]) => ({ date, count })),
  });
});

export default router;
