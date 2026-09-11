import { Router, type Request, type Response } from "express";
import { prisma } from "../prisma.js";
import { requireAuth } from "../middleware/auth.js";
import { validateBody } from "../middleware/validate.js";
import { writeupInputSchema } from "../schemas.js";
import { slugify } from "../utils/slugify.js";
import { logActivity } from "../utils/activity.js";

export const writeupsRouter = Router();

writeupsRouter.get("/", async (req: Request, res: Response) => {
  const { published, category, search } = req.query;
  const where: Record<string, unknown> = {};
  if (category) where.category = String(category);
  if (search) where.title = { contains: String(search), mode: "insensitive" };

  const publishedParam = String(published ?? "true");
  if (publishedParam !== "all") where.published = publishedParam === "true";

  const writeups = await prisma.writeup.findMany({
    where: where as never,
    orderBy: { publishedAt: "desc" },
  });
  return res.json(writeups);
});

writeupsRouter.get("/:slug", async (req: Request, res: Response) => {
  const writeup = await prisma.writeup.findUnique({ where: { slug: req.params.slug } });
  if (!writeup) return res.status(404).json({ message: "Writeup not found" });
  return res.json(writeup);
});

writeupsRouter.post(
  "/",
  requireAuth,
  validateBody(writeupInputSchema),
  async (req: Request, res: Response) => {
    const data = { ...req.body };
    if (!data.slug) {
      data.slug = slugify(data.title);
      if (!data.slug) return res.status(400).json({ message: "Could not derive a slug from title" });
    }
    const existing = await prisma.writeup.findUnique({ where: { slug: data.slug } });
    if (existing) return res.status(409).json({ message: "Writeup with this slug already exists" });

    const writeup = await prisma.writeup.create({
      data: {
        ...data,
        publishedAt: data.published ? data.publishedAt ?? new Date() : null,
      },
    });
    await logActivity("create", "writeup", writeup.id, { title: writeup.title });
    return res.status(201).json(writeup);
  }
);

writeupsRouter.put(
  "/:id",
  requireAuth,
  validateBody(writeupInputSchema),
  async (req: Request, res: Response) => {
    const id = req.params.id;
    const existing = await prisma.writeup.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ message: "Writeup not found" });

    const data = { ...req.body };
    if (!data.slug) data.slug = slugify(data.title);
    else if (data.slug !== existing.slug) {
      const clash = await prisma.writeup.findUnique({ where: { slug: data.slug } });
      if (clash) return res.status(409).json({ message: "Writeup with this slug already exists" });
    }

    const writeup = await prisma.writeup.update({
      where: { id },
      data: {
        ...data,
        publishedAt: data.published ? data.publishedAt ?? existing.publishedAt ?? new Date() : null,
      },
    });
    await logActivity("update", "writeup", writeup.id, { title: writeup.title });
    return res.json(writeup);
  }
);

writeupsRouter.delete("/:id", requireAuth, async (req: Request, res: Response) => {
  const id = req.params.id;
  const existing = await prisma.writeup.findUnique({ where: { id } });
  if (!existing) return res.status(404).json({ message: "Writeup not found" });
  await prisma.writeup.delete({ where: { id } });
  await logActivity("delete", "writeup", id, { title: existing.title });
  return res.json({ success: true });
});