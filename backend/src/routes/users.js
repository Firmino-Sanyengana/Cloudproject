import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { authRequired, adminOnly } from "../middlewares/auth.js";

const router = Router();

/**
 * @openapi
 * /api/users:
 *   get:
 *     tags: [Users]
 *     summary: Listar todos os utilizadores (admin)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Array de utilizadores sem campo password
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
 *                   role:      { type: string, enum: [STUDENT, ADMIN] }
 *                   createdAt: { type: string, format: date-time }
 *       403: { description: Apenas administradores }
 */
router.get("/", authRequired, adminOnly, async (req, res) => {
  res.json(await prisma.user.findMany({ select: { id: true, name: true, email: true, role: true, createdAt: true } }));
});

/**
 * @openapi
 * /api/users/{id}/role:
 *   patch:
 *     tags: [Users]
 *     summary: Alterar o papel (role) de um utilizador (admin)
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
 *             required: [role]
 *             properties:
 *               role: { type: string, enum: [STUDENT, ADMIN] }
 *     responses:
 *       200:
 *         description: Role actualizada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:   { type: integer }
 *                 role: { type: string }
 *       400: { description: Role inválida }
 *       403: { description: Apenas administradores }
 */
router.patch("/:id/role", authRequired, adminOnly, async (req, res) => {
  const { role } = req.body;
  if (!["STUDENT", "ADMIN"].includes(role)) return res.status(400).json({ message: "Role inválida" });
  const u = await prisma.user.update({ where: { id: Number(req.params.id) }, data: { role }, select: { id: true, role: true } });
  res.json(u);
});

export default router;
