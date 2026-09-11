import { Router, type Request, type Response } from "express";
import { prisma } from "../prisma.js";
import { requireAuth } from "../middleware/auth.js";
import { validateBody } from "../middleware/validate.js";
import { certificateInputSchema } from "../schemas.js";
import { logActivity } from "../utils/activity.js";

export const certificatesRouter = Router();

certificatesRouter.get("/", async (_req: Request, res: Response) => {
  const items = await prisma.certificate.findMany({ orderBy: [{ sortOrder: "asc" }, { date: "desc" }] });
  return res.json(items);
});

certificatesRouter.post(
  "/",
  requireAuth,
  validateBody(certificateInputSchema),
  async (req: Request, res: Response) => {
    const item = await prisma.certificate.create({ data: req.body });
    await logActivity("create", "certificate", item.id, { title: item.title });
    return res.status(201).json(item);
  }
);

certificatesRouter.put(
  "/:id",
  requireAuth,
  validateBody(certificateInputSchema),
  async (req: Request, res: Response) => {
    const existing = await prisma.certificate.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ message: "Certificate not found" });
    const item = await prisma.certificate.update({ where: { id: req.params.id }, data: req.body });
    await logActivity("update", "certificate", item.id, { title: item.title });
    return res.json(item);
  }
);

certificatesRouter.delete("/:id", requireAuth, async (req: Request, res: Response) => {
  const existing = await prisma.certificate.findUnique({ where: { id: req.params.id } });
  if (!existing) return res.status(404).json({ message: "Certificate not found" });
  await prisma.certificate.delete({ where: { id: req.params.id } });
  await logActivity("delete", "certificate", req.params.id, { title: existing.title });
  return res.json({ success: true });
});