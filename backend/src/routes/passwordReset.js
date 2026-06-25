import { Router } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { validate } from "../middlewares/validate.js";
import { sendMail } from "../lib/mailer.js";

const router = Router();

/**
 * @openapi
 * /api/password/forgot:
 *   post:
 *     tags: [Password]
 *     summary: Pedir código de 6 dígitos por email para recuperar a senha
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email: { type: string, format: email }
 *     responses:
 *       200:
 *         description: Responde sempre 200 para evitar enumeração de emails
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:      { type: boolean }
 *                 message: { type: string }
 */
router.post(
  "/forgot",
  validate(z.object({ email: z.string().email() })),
  async (req, res) => {
    const { email } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (user) {
      const code = String(Math.floor(100000 + Math.random() * 900000));
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
      await prisma.passwordReset.create({ data: { userId: user.id, code, expiresAt } });
      await sendMail({
        to: email,
        subject: "Sofulano Ukulondja — Código de recuperação",
        text:
          `Olá, ${user.name}.\n\nO seu código de recuperação é: ${code}\n` +
          `Este código expira em 15 minutos.\n\nSe não pediu, ignore este email.`,
      });
    }
    res.json({ ok: true, message: "Se o email existir, um código foi enviado." });
  }
);

/**
 * @openapi
 * /api/password/reset:
 *   post:
 *     tags: [Password]
 *     summary: Redefinir a senha com o código de 6 dígitos recebido por email
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, code, password]
 *             properties:
 *               email:    { type: string, format: email }
 *               code:     { type: string, minLength: 6, maxLength: 6 }
 *               password: { type: string, minLength: 6, maxLength: 100 }
 *     responses:
 *       200:
 *         description: Senha redefinida com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:      { type: boolean }
 *                 message: { type: string }
 *       400: { description: Código inválido ou expirado }
 */
router.post(
  "/reset",
  validate(
    z.object({
      email:    z.string().email(),
      code:     z.string().length(6),
      password: z.string().min(6).max(100),
    })
  ),
  async (req, res) => {
    const { email, code, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(400).json({ message: "Código inválido" });
    const pr = await prisma.passwordReset.findFirst({
      where: { userId: user.id, code, used: false, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: "desc" },
    });
    if (!pr) return res.status(400).json({ message: "Código inválido ou expirado" });
    const hash = await bcrypt.hash(password, 10);
    await prisma.$transaction([
      prisma.user.update({ where: { id: user.id }, data: { password: hash } }),
      prisma.passwordReset.update({ where: { id: pr.id }, data: { used: true } }),
    ]);
    res.json({ ok: true, message: "Senha redefinida com sucesso" });
  }
);

export default router;
