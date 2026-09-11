import express, { type NextFunction, type Request, type Response } from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import { rateLimit } from "express-rate-limit";
import "dotenv/config";

import { authRouter } from "./auth.js";
import { projectsRouter } from "./routes/projects.js";
import { writeupsRouter } from "./routes/writeups.js";
import { skillsRouter } from "./routes/skills.js";
import { certificatesRouter } from "./routes/certificates.js";
import { achievementsRouter } from "./routes/achievements.js";
import { socialLinksRouter } from "./routes/social-links.js";
import { siteSettingsRouter } from "./routes/site-settings.js";
import { messagesRouter } from "./routes/messages.js";
import { dashboardRouter } from "./routes/dashboard.js";
import { activityRouter } from "./routes/activity.js";

const app = express();
const PORT = Number(process.env.PORT) || 4000;

app.set("trust proxy", 1);

app.use(helmet());

const corsOrigins = (process.env.CORS_ORIGIN || "http://localhost:3000")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);
app.use(
  cors({
    origin: corsOrigins.length > 0 ? corsOrigins : false,
    credentials: true,
  })
);
app.use(express.json({ limit: "2mb" }));
app.use(cookieParser());

// Baseline API limiter — public + admin endpoints share a sane ceiling
const apiLimiter = rateLimit({
  windowMs: 60_000,
  limit: 120,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { message: "Too many requests, slow down" },
});
app.use("/api", apiLimiter);

// Stricter limiter for credentials endpoint
const loginLimiter = rateLimit({
  windowMs: 15 * 60_000,
  limit: 10,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { message: "Too many login attempts, try again later" },
});
app.use("/api/auth/login", loginLimiter);

// Contact form flood protection
const messageLimiter = rateLimit({
  windowMs: 60 * 60_000,
  limit: 5,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { message: "Too many messages sent, try again later" },
});
app.use("/api/messages", messageLimiter);

// Health check (used by docker healthcheck)
app.get("/api/health", (_req: Request, res: Response) => {
  res.json({ status: "ok", uptime: process.uptime(), timestamp: new Date().toISOString() });
});

// Auth
app.use("/api/auth", authRouter);

// Public + protected resources
app.use("/api/projects", projectsRouter);
app.use("/api/writeups", writeupsRouter);
app.use("/api/skills", skillsRouter);
app.use("/api/certificates", certificatesRouter);
app.use("/api/achievements", achievementsRouter);
app.use("/api/social-links", socialLinksRouter);
app.use("/api/site-settings", siteSettingsRouter);
app.use("/api/messages", messagesRouter);
app.use("/api/activity", activityRouter);

// Admin-only
app.use("/api/admin/dashboard", dashboardRouter);

// 404 for unknown API routes
app.use("/api", (_req: Request, res: Response) => {
  res.status(404).json({ message: "Not found" });
});

// Central error handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ message: "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`KKARINZZZ API listening on :${PORT}`);
});