import { Router } from "express";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import { authRequired, adminOnly } from "../middlewares/auth.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOAD_DIR = path.resolve(__dirname, "../../uploads");
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (_q, _f, cb) => cb(null, UPLOAD_DIR),
  filename: (_q, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const safe = "img-" + Date.now() + "-" + Math.round(Math.random() * 1e6) + ext;
    cb(null, safe);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 4 * 1024 * 1024 },
  fileFilter: (_q, file, cb) => {
    const ok = /image\/(png|jpe?g|webp|gif)/.test(file.mimetype);
    cb(ok ? null : new Error("Apenas imagens (png, jpg, webp, gif)"), ok);
  },
});

const router = Router();

/**
 * @openapi
 * /api/uploads/image:
 *   post:
 *     tags: [Uploads]
 *     summary: Fazer upload de uma imagem de capa de curso (admin)
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [file]
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Imagem PNG, JPG, WEBP ou GIF (máx 4 MB)
 *     responses:
 *       201:
 *         description: Upload bem-sucedido — devolve URL relativa da imagem
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 url:      { type: string, example: /uploads/img-1717000000000-123456.jpg }
 *                 filename: { type: string }
 *       400: { description: Ficheiro em falta ou tipo inválido }
 *       403: { description: Apenas administradores }
 */
router.post("/image", authRequired, adminOnly, upload.single("file"), (req, res) => {
  if (!req.file) return res.status(400).json({ message: "Ficheiro obrigatório" });
  const url = `/uploads/${req.file.filename}`;
  res.status(201).json({ url, filename: req.file.filename });
});

export default router;
