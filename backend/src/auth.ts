import { Router, type Request, type Response } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "./prisma.js";
import { requireAuth, signAuthToken, authCookieOptions, COOKIE } from "./middleware/auth.js";
import { loginSchema } from "./schemas.js";

export const authRouter = Router();

authRouter.post("/login", async (req: Request, res: Response) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Username and password are required" });
  }
  const { username, password } = parsed.data;

  const user = await prisma.user.findUnique({ where: { username } });
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const token = signAuthToken({ id: user.id, username: user.username });
  res.cookie(COOKIE, token, authCookieOptions());
  return res.json({ user: { id: user.id, username: user.username } });
});

authRouter.post("/logout", (_req: Request, res: Response) => {
  res.clearCookie(COOKIE, { path: "/" });
  return res.json({ success: true });
});

authRouter.get("/me", requireAuth, (req: Request, res: Response) => {
  return res.json({ user: req.user });
});