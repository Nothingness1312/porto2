import { Router, type Request, type Response } from "express";
import { prisma } from "../prisma.js";
import { requireAuth } from "../middleware/auth.js";
import { validateBody } from "../middleware/validate.js";
import { socialLinkInputSchema } from "../schemas.js";
import { logActivity } from "../utils/activity.js";

export const socialLinksRouter = Router();

socialLinksRouter.get("/", async (_req: Request, res: Response) => {
  const items = await prisma.socialLink.findMany({ orderBy: [{ sortOrder: "asc" }] });
  return res.json(items);
});

socialLinksRouter.post(
  "/",
  requireAuth,
  validateBody(socialLinkInputSchema),
  async (req: Request, res: Response) => {
    const item = await prisma.socialLink.create({ data: req.body });
    await logActivity("create", "social-link", item.id, { platform: item.platform });
    return res.status(201).json(item);
  }
);

socialLinksRouter.put(
  "/:id",
  requireAuth,
  validateBody(socialLinkInputSchema),
  async (req: Request, res: Response) => {
    const existing = await prisma.socialLink.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ message: "Social link not found" });
    const item = await prisma.socialLink.update({ where: { id: req.params.id }, data: req.body });
    await logActivity("update", "social-link", item.id, { platform: item.platform });
    return res.json(item);
  }
);

socialLinksRouter.delete("/:id", requireAuth, async (req: Request, res: Response) => {
  const existing = await prisma.socialLink.findUnique({ where: { id: req.params.id } });
  if (!existing) return res.status(404).json({ message: "Social link not found" });
  await prisma.socialLink.delete({ where: { id: req.params.id } });
  await logActivity("delete", "social-link", req.params.id, { platform: existing.platform });
  return res.json({ success: true });
});