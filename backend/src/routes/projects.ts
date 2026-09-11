import { Router, type Request, type Response } from "express";
import { prisma } from "../prisma.js";
import { requireAuth } from "../middleware/auth.js";
import { validateBody } from "../middleware/validate.js";
import { projectInputSchema } from "../schemas.js";
import { slugify } from "../utils/slugify.js";
import { logActivity } from "../utils/activity.js";

export const projectsRouter = Router();

const PASTEL_ID_LEN = 25; // cuid() length

projectsRouter.get("/", async (req: Request, res: Response) => {
  const { published, featured, category, search } = req.query;

  // Public callers only see published projects unless explicitly asking for all
  let where: Record<string, unknown> = {};
  if (featured === "true") where.featured = true;
  if (category) where.category = String(category);
  if (search) {
    where.title = { contains: String(search), mode: "insensitive" };
  }

  const publishedParam = String(published ?? "true");
  where.published = publishedParam === "all" ? undefined : publishedParam === "true";

  if (!where.published) delete where.published;

  const projects = await prisma.project.findMany({
    where: where as never,
    orderBy: [{ featured: "desc" }, { date: "desc" }],
  });
  return res.json(projects);
});

projectsRouter.get("/:slug", async (req: Request, res: Response) => {
  const project = await prisma.project.findUnique({ where: { slug: req.params.slug } });
  if (!project) return res.status(404).json({ message: "Project not found" });
  return res.json(project);
});

projectsRouter.post(
  "/",
  requireAuth,
  validateBody(projectInputSchema),
  async (req: Request, res: Response) => {
    const data = { ...req.body };
    if (!data.slug) {
      data.slug = slugify(data.title);
      if (!data.slug) return res.status(400).json({ message: "Could not derive a slug from title" });
    }
    const existing = await prisma.project.findUnique({ where: { slug: data.slug } });
    if (existing) return res.status(409).json({ message: "Project with this slug already exists" });

    const project = await prisma.project.create({
      data: {
        ...data,
        githubUrl: data.githubUrl ?? null,
        demoUrl: data.demoUrl ?? null,
        coverImage: data.coverImage ?? null,
      },
    });
    await logActivity("create", "project", project.id, { title: project.title });
    return res.status(201).json(project);
  }
);

projectsRouter.put(
  "/:id",
  requireAuth,
  validateBody(projectInputSchema),
  async (req: Request, res: Response) => {
    const id = req.params.id;
    const existing = await prisma.project.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ message: "Project not found" });

    const data = { ...req.body };
    if (!data.slug) data.slug = slugify(data.title);
    else if (data.slug !== existing.slug) {
      const clash = await prisma.project.findUnique({ where: { slug: data.slug } });
      if (clash) return res.status(409).json({ message: "Project with this slug already exists" });
    }

    const project = await prisma.project.update({
      where: { id },
      data: {
        ...data,
        githubUrl: data.githubUrl ?? null,
        demoUrl: data.demoUrl ?? null,
        coverImage: data.coverImage ?? null,
      },
    });
    await logActivity("update", "project", project.id, { title: project.title });
    return res.json(project);
  }
);

projectsRouter.delete("/:id", requireAuth, async (req: Request, res: Response) => {
  const id = req.params.id;
  const existing = await prisma.project.findUnique({ where: { id } });
  if (!existing) return res.status(404).json({ message: "Project not found" });
  await prisma.project.delete({ where: { id } });
  await logActivity("delete", "project", id, { title: existing.title });
  return res.json({ success: true });
});