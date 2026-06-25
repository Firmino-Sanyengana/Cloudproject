import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { authRequired } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";

const router = Router();

const schema = z.object({
  text:   z.string().min(1).max(1000),
  source: z.string().min(2).max(5),
  target: z.string().min(2).max(5),
});

/**
 * @openapi
 * /api/translate:
 *   post:
 *     tags: [Translate]
 *     summary: Traduzir texto via MyMemory API e guardar no histórico
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [text, source, target]
 *             properties:
 *               text:   { type: string, minLength: 1, maxLength: 1000 }
 *               source: { type: string, example: pt, description: "Código de língua de origem (ex: pt, en)" }
 *               target: { type: string, example: en, description: "Código de língua de destino (ex: en, fr)" }
 *     responses:
 *       200:
 *         description: Tradução devolvida e guardada no histórico
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 translation: { type: string }
 *       502: { description: Falha ao contactar a API de tradução }
 */
router.post("/", authRequired, validate(schema), async (req, res) => {
  const { text, source, target } = req.body;
  try {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${source}|${target}`;
    const r = await fetch(url);
    const data = await r.json();
    const translation = data?.responseData?.translatedText || "";
    await prisma.history.create({ data: { userId: req.user.id, text, translation, source, target } });
    res.json({ translation });
  } catch (e) {
    res.status(502).json({ message: "Falha ao traduzir" });
  }
});

/**
 * @openapi
 * /api/translate/exercise:
 *   post:
 *     tags: [Translate]
 *     summary: Gerar exercício de tradução (lacuna e palavras embaralhadas)
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [text, source, target]
 *             properties:
 *               text:   { type: string }
 *               source: { type: string }
 *               target: { type: string }
 *     responses:
 *       200:
 *         description: Exercício gerado a partir da tradução
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 translation: { type: string }
 *                 scrambled:   { type: array, items: { type: string }, description: "Palavras em ordem aleatória" }
 *                 blanked:     { type: string, description: "Frase com uma palavra substituída por _____" }
 *                 missing:     { type: string, description: "A palavra que falta" }
 */
router.post("/exercise", authRequired, validate(schema), async (req, res) => {
  const { text, source, target } = req.body;
  const r = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${source}|${target}`);
  const data = await r.json();
  const translation = data?.responseData?.translatedText || "";
  const words = translation.split(" ");
  const scrambled = [...words].sort(() => Math.random() - 0.5);
  const idx = Math.floor(words.length / 2);
  const blanked = words.map((w, i) => (i === idx ? "_____" : w)).join(" ");
  res.json({ translation, scrambled, blanked, missing: words[idx] });
});

export default router;
