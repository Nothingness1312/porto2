import { Router, type Request, type Response } from "express";
import { prisma } from "../prisma.js";
import { requireAuth } from "../middleware/auth.js";

export const activityRouter = Router();

activityRouter.get("/", requireAuth, async (_req: Request, res: Response) => {
  const logs = await prisma.activityLog.findMany({ orderBy: { createdAt: "desc" }, take: 50 });
  return res.json(logs);
});