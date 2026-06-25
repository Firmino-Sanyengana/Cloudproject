import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";
import rateLimit from "express-rate-limit";
import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";

import auth from "./routes/auth.js";
import users from "./routes/users.js";
import courses from "./routes/courses.js";
import enrollments from "./routes/enrollments.js";
import lessons from "./routes/lessons.js";
import quizzes from "./routes/quizzes.js";
import exercises from "./routes/exercises.js";
import progress from "./routes/progress.js";
import translate from "./routes/translate.js";
import favorites from "./routes/favorites.js";
import history from "./routes/history.js";
import passwordReset from "./routes/passwordReset.js";
import chat from "./routes/chat.js";
import notifications from "./routes/notifications.js";
import adminMessages from "./routes/adminMessages.js";
import stats from "./routes/stats.js";
import uploads from "./routes/uploads.js";
import { errorHandler, notFound } from "./middlewares/error.js";
import { startCleanupJob } from "./jobs/cleanupPendingRegistrations.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors({ origin: process.env.CORS_ORIGIN?.split(",") || "*", credentials: true }));
app.use(express.json({ limit: "2mb" }));
app.use(morgan("dev"));
app.use(rateLimit({ windowMs: 60_000, max: 300 }));

// Servir uploads (capas de cursos)
app.use("/uploads", express.static(path.resolve(__dirname, "../uploads")));
console.log("CORS_ORIGIN =", process.env.CORS_ORIGIN);

const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Sofulano Ukulondja API",
      version: "2.0.0",
      description:
        "API da plataforma educativa Sofulano Ukulondja — cursos, lições, quizzes, exercícios, chat por curso, notificações, mensagens administrativas, recuperação de senha e estatísticas.",
    },
    servers: [{ url: "http://localhost:" + (process.env.PORT || 4000) }],
    components: {
      securitySchemes: { bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" } },
    },
    security: [{ bearerAuth: [] }],
    tags: [
      { name: "Auth", description: "Autenticação e sessão" },
      { name: "Password", description: "Recuperação de senha por código" },
      { name: "Users", description: "Utilizadores (admin)" },
      { name: "Courses", description: "Cursos" },
      { name: "Enrollments", description: "Inscrições em cursos" },
      { name: "Lessons", description: "Lições" },
      { name: "Exercises", description: "Exercícios (lacunas, embaralhadas, tradução)" },
      { name: "Quizzes", description: "Quizzes" },
      { name: "Progress", description: "Progresso do aluno" },
      { name: "Chat", description: "Chat por curso" },
      { name: "Notifications", description: "Notificações do aluno" },
      { name: "AdminMessages", description: "Mensagens enviadas pelo admin" },
      { name: "Translate", description: "Tradução automática" },
      { name: "Favorites", description: "Frases favoritas" },
      { name: "History", description: "Histórico de traduções" },
      { name: "Stats", description: "Estatísticas administrativas" },
      { name: "Uploads", description: "Upload de imagens" },
    ],
  },
  apis: ["./src/routes/*.js"],
});

app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, { customSiteTitle: "Sofulano Ukulondja API" }));
app.get("/openapi.json", (_q, r) => r.json(swaggerSpec));

app.get("/", (_q, r) => r.json({
  name: "Sofulano Ukulondja API",
  version: "2.0.0",
  docs: "/docs",
  openapi: "/openapi.json",
}));

app.use("/api/auth", auth);
app.use("/api/password", passwordReset);
app.use("/api/users", users);
app.use("/api/courses", courses);
app.use("/api/enrollments", enrollments);
app.use("/api/lessons", lessons);
app.use("/api/exercises", exercises);
app.use("/api/quizzes", quizzes);
app.use("/api/progress", progress);
app.use("/api/translate", translate);
app.use("/api/favorites", favorites);
app.use("/api/history", history);
app.use("/api/chat", chat);
app.use("/api/notifications", notifications);
app.use("/api/admin-messages", adminMessages);
app.use("/api/stats", stats);
app.use("/api/uploads", uploads);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`\n🌍 Sofulano Ukulondja API`);
  console.log(`   ▶ http://localhost:${PORT}`);
  console.log(`   📚 Swagger: http://localhost:${PORT}/docs\n`);
  startCleanupJob();

});