import { Router, type Request, type Response } from "express";
import { prisma } from "../prisma.js";
import { requireAuth } from "../middleware/auth.js";
import { validateBody } from "../middleware/validate.js";
import { achievementInputSchema } from "../schemas.js";
import { logActivity } from "../utils/activity.js";

export const achievementsRouter = Router();

achievementsRouter.get("/", async (_req: Request, res: Response) => {
  const items = await prisma.achievement.findMany({ orderBy: { date: "desc" } });
  return res.json(items);
});

achievementsRouter.post(
  "/",
  requireAuth,
  validateBody(achievementInputSchema),
  async (req: Request, res: Response) => {
    const item = await prisma.achievement.create({ data: req.body });
    await logActivity("create", "achievement", item.id, { title: item.title });
    return res.status(201).json(item);
  }
);

achievementsRouter.put(
  "/:id",
  requireAuth,
  validateBody(achievementInputSchema),
  async (req: Request, res: Response) => {
    const existing = await prisma.achievement.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ message: "Achievement not found" });
    const item = await prisma.achievement.update({ where: { id: req.params.id }, data: req.body });
    await logActivity("update", "achievement", item.id, { title: item.title });
    return res.json(item);
  }
);

achievementsRouter.delete("/:id", requireAuth, async (req: Request, res: Response) => {
  const existing = await prisma.achievement.findUnique({ where: { id: req.params.id } });
  if (!existing) return res.status(404).json({ message: "Achievement not found" });
  await prisma.achievement.delete({ where: { id: req.params.id } });
  await logActivity("delete", "achievement", req.params.id, { title: existing.title });
  return res.json({ success: true });
});