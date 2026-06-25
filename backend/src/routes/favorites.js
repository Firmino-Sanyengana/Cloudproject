import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { authRequired } from "../middlewares/auth.js";

const router = Router();

/**
 * @openapi
 * /api/favorites:
 *   get:
 *     tags: [Favorites]
 *     summary: Listar frases favoritas do utilizador autenticado
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Array de favoritos ordenados por data (mais recente primeiro)
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:          { type: integer }
 *                   text:        { type: string }
 *                   translation: { type: string }
 *                   source:      { type: string }
 *                   target:      { type: string }
 *                   createdAt:   { type: string, format: date-time }
 */
router.get("/", authRequired, async (req, res) => {
  res.json(await prisma.favorite.findMany({ where: { userId: req.user.id }, orderBy: { createdAt: "desc" } }));
});

/**
 * @openapi
 * /api/favorites:
 *   post:
 *     tags: [Favorites]
 *     summary: Guardar frase como favorita
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [text, translation, source, target]
 *             properties:
 *               text:        { type: string }
 *               translation: { type: string }
 *               source:      { type: string }
 *               target:      { type: string }
 *     responses:
 *       201: { description: Favorito criado }
 */
router.post("/", authRequired, async (req, res) => {
  const { text, translation, source, target } = req.body;
  const f = await prisma.favorite.create({ data: { userId: req.user.id, text, translation, source, target } });
  res.status(201).json(f);
});

/**
 * @openapi
 * /api/favorites/{id}:
 *   delete:
 *     tags: [Favorites]
 *     summary: Remover frase dos favoritos
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Favorito removido }
 */
router.delete("/:id", authRequired, async (req, res) => {
  await prisma.favorite.deleteMany({ where: { id: Number(req.params.id), userId: req.user.id } });
  res.json({ ok: true });
});

export default router;
