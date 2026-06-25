import { Router } from "express";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { signToken } from "../lib/jwt.js";
import { validate } from "../middlewares/validate.js";
import { authRequired } from "../middlewares/auth.js";
import { sendMail } from "../lib/mailer.js";

const router = Router();

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:4001";
const VERIFICATION_TOKEN_TTL_MS = 24 * 60 * 60 * 1000; // 24h

const registerSchema = z.object({
  name: z
    .string()
    .min(2)
    .max(80)
    .regex(/^[A-Za-zÀ-ÖØ-öø-ÿ\s'-]+$/, "O nome não pode conter números ou símbolos"),
  email: z.string().email().max(120),
  password: z.string().min(6).max(100),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const resendSchema = z.object({
  email: z.string().email(),
});

function buildVerificationEmail(name, token) {
  const link = `${FRONTEND_URL}/verificar-email?token=${token}`;
  return {
    subject: "Confirme o seu e-mail",
    text: `Olá ${name}, confirme o seu e-mail clicando no link: ${link} (válido por 24 horas).`,
    html: `<p>Olá <b>${name}</b>,</p>
           <p>Confirme o seu e-mail clicando no botão abaixo (válido por 24 horas):</p>
           <p><a href="${link}" style="background:#4f46e5;color:#fff;padding:10px 18px;border-radius:6px;text-decoration:none">Confirmar e-mail</a></p>
           <p>Ou copie este link: ${link}</p>`,
  };
}

// Envia o e-mail sem nunca derrubar o processo caso falhe (ex: sem internet/DNS)
async function safeSendVerificationEmail(name, email, token) {
  const { subject, text, html } = buildVerificationEmail(name, token);
  try {
    await sendMail({ to: email, subject, text, html });
  } catch (err) {
    console.error(`[mailer] falha ao enviar e-mail para ${email}:`, err.message);
  }
}

/**
 * @openapi
 * /api/auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Iniciar registo (cria conta apenas após confirmação do e-mail)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name:     { type: string, minLength: 2, maxLength: 80 }
 *               email:    { type: string, format: email }
 *               password: { type: string, minLength: 6 }
 *     responses:
 *       201: { description: E-mail de confirmação enviado }
 *       409: { description: E-mail já registado }
 */
router.post("/register", validate(registerSchema), async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return res.status(409).json({ message: "E-mail já registado" });

    const hash = await bcrypt.hash(password, 10);
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationTokenExpiresAt = new Date(Date.now() + VERIFICATION_TOKEN_TTL_MS);

    const pending = await prisma.pendingRegistration.upsert({
      where: { email },
      update: {
        name,
        password: hash,
        verificationToken,
        verificationTokenExpiresAt,
      },
      create: {
        name,
        email,
        password: hash,
        verificationToken,
        verificationTokenExpiresAt,
      },
    });

    await safeSendVerificationEmail(pending.name, pending.email, verificationToken);

    res.status(201).json({
      message: "Verifique o seu e-mail para concluir o registo. O link é válido por 24 horas.",
    });
  } catch (err) {
    next(err);
  }
});

/**
 * @openapi
 * /api/auth/verify-email:
 *   get:
 *     tags: [Auth]
 *     summary: Confirmar e-mail e criar a conta definitiva
 *     parameters:
 *       - in: query
 *         name: token
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Conta criada e login automático }
 *       400: { description: Token inválido ou expirado }
 *       409: { description: E-mail já registado por outra conta }
 */
router.get("/verify-email", async (req, res, next) => {
  try {
    const { token } = req.query;
    if (!token || typeof token !== "string") {
      return res.status(400).json({ message: "Token inválido" });
    }

    const pending = await prisma.pendingRegistration.findUnique({ where: { verificationToken: token } });

    if (!pending) {
      return res.status(400).json({ message: "Link inválido ou já utilizado" });
    }

    if (pending.verificationTokenExpiresAt < new Date()) {
      await prisma.pendingRegistration.delete({ where: { id: pending.id } });
      return res.status(400).json({ message: "Link expirado. Registe-se novamente." });
    }

    const existingUser = await prisma.user.findUnique({ where: { email: pending.email } });
    if (existingUser) {
      await prisma.pendingRegistration.delete({ where: { id: pending.id } });
      return res.status(409).json({ message: "E-mail já registado" });
    }

    const user = await prisma.user.create({
      data: {
        name: pending.name,
        email: pending.email,
        password: pending.password,
        emailVerified: true,
      },
    });

    await prisma.pendingRegistration.delete({ where: { id: pending.id } });

    const jwtToken = signToken({ id: user.id, role: user.role, name: user.name });
    res.json({
      message: "E-mail confirmado e conta criada com sucesso!",
      token: jwtToken,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    next(err);
  }
});

/**
 * @openapi
 * /api/auth/resend-verification:
 *   post:
 *     tags: [Auth]
 *     summary: Reenviar e-mail de confirmação para um registo pendente
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
 *       200: { description: E-mail reenviado (ou mensagem genérica) }
 */
router.post("/resend-verification", validate(resendSchema), async (req, res, next) => {
  try {
    const { email } = req.body;
    const genericMsg = { message: "Se houver um registo pendente para este e-mail, um novo link foi enviado." };

    const pending = await prisma.pendingRegistration.findUnique({ where: { email } });
    if (!pending) return res.json(genericMsg);

    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationTokenExpiresAt = new Date(Date.now() + VERIFICATION_TOKEN_TTL_MS);

    await prisma.pendingRegistration.update({
      where: { id: pending.id },
      data: { verificationToken, verificationTokenExpiresAt },
    });

    await safeSendVerificationEmail(pending.name, pending.email, verificationToken);

    res.json(genericMsg);
  } catch (err) {
    next(err);
  }
});

/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Fazer login e obter token JWT
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:    { type: string, format: email }
 *               password: { type: string, minLength: 6 }
 *     responses:
 *       200: { description: Login bem-sucedido }
 *       401: { description: Credenciais inválidas }
 *       403: { description: E-mail ainda não confirmado (registo pendente) }
 */
router.post("/login", validate(loginSchema), async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      const pending = await prisma.pendingRegistration.findUnique({ where: { email } });
      if (pending) {
        const ok = await bcrypt.compare(password, pending.password);
        if (ok) {
          return res.status(403).json({
            message: "Confirme o seu e-mail para concluir o registo. Verifique a sua caixa de entrada.",
            code: "EMAIL_NOT_VERIFIED",
          });
        }
      }
      return res.status(401).json({ message: "Credenciais inválidas" });
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ message: "Credenciais inválidas" });

    const token = signToken({ id: user.id, role: user.role, name: user.name });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    next(err);
  }
});

/**
 * @openapi
 * /api/auth/me:
 *   get:
 *     tags: [Auth]
 *     summary: Dados do utilizador autenticado
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Perfil do utilizador }
 *       401: { description: Token inválido ou ausente }
 */
router.get("/me", authRequired, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });
    res.json(user);
  } catch (err) {
    next(err);
  }
});

export default router;