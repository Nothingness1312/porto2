import { Router, type Request, type Response } from "express";
import { prisma } from "../prisma.js";
import { requireAuth } from "../middleware/auth.js";
import { validateBody } from "../middleware/validate.js";
import { skillInputSchema } from "../schemas.js";
import { logActivity } from "../utils/activity.js";

export const skillsRouter = Router();

skillsRouter.get("/", async (req: Request, res: Response) => {
  const { category } = req.query;
  const where = category ? { category: String(category) } : undefined;
  const skills = await prisma.skill.findMany({
    where,
    orderBy: [{ category: "asc" }, { sortOrder: "asc" }],
  });
  return res.json(skills);
});

skillsRouter.post(
  "/",
  requireAuth,
  validateBody(skillInputSchema),
  async (req: Request, res: Response) => {
    const skill = await prisma.skill.create({ data: req.body });
    await logActivity("create", "skill", skill.id, { name: skill.name });
    return res.status(201).json(skill);
  }
);

skillsRouter.put(
  "/:id",
  requireAuth,
  validateBody(skillInputSchema),
  async (req: Request, res: Response) => {
    const existing = await prisma.skill.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ message: "Skill not found" });
    const skill = await prisma.skill.update({ where: { id: req.params.id }, data: req.body });
    await logActivity("update", "skill", skill.id, { name: skill.name });
    return res.json(skill);
  }
);

skillsRouter.delete("/:id", requireAuth, async (req: Request, res: Response) => {
  const existing = await prisma.skill.findUnique({ where: { id: req.params.id } });
  if (!existing) return res.status(404).json({ message: "Skill not found" });
  await prisma.skill.delete({ where: { id: req.params.id } });
  await logActivity("delete", "skill", req.params.id, { name: existing.name });
  return res.json({ success: true });
});