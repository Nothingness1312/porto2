import { Router, type Request, type Response } from "express";
import { prisma } from "../prisma.js";
import { requireAuth } from "../middleware/auth.js";
import { validateBody } from "../middleware/validate.js";
import { messageInputSchema, messageReadSchema } from "../schemas.js";
import { logActivity } from "../utils/activity.js";

export const messagesRouter = Router();

// Public: submit a contact form message
messagesRouter.post(
  "/",
  validateBody(messageInputSchema),
  async (req: Request, res: Response) => {
    const item = await prisma.message.create({ data: req.body });
    await logActivity("create", "message", item.id, { name: item.name });
    return res.status(201).json(item);
  }
);

// Admin: list all messages (newest first)
messagesRouter.get("/", requireAuth, async (_req: Request, res: Response) => {
  const items = await prisma.message.findMany({ orderBy: { createdAt: "desc" } });
  return res.json(items);
});

// Admin: mark message as read / unread
messagesRouter.patch(
  "/:id",
  requireAuth,
  validateBody(messageReadSchema),
  async (req: Request, res: Response) => {
    const existing = await prisma.message.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ message: "Message not found" });
    const item = await prisma.message.update({
      where: { id: req.params.id },
      data: { read: req.body.read },
    });
    return res.json(item);
  }
);

// Admin: delete message
messagesRouter.delete("/:id", requireAuth, async (req: Request, res: Response) => {
  const existing = await prisma.message.findUnique({ where: { id: req.params.id } });
  if (!existing) return res.status(404).json({ message: "Message not found" });
  await prisma.message.delete({ where: { id: req.params.id } });
  await logActivity("delete", "message", req.params.id, { name: existing.name });
  return res.json({ success: true });
});