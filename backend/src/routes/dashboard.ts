import { Router, type Request, type Response } from "express";
import { prisma } from "../prisma.js";
import { requireAuth } from "../middleware/auth.js";

export const dashboardRouter = Router();

dashboardRouter.get("/stats", requireAuth, async (_req: Request, res: Response) => {
  const [projects, writeups, skills, achievements, certificates, socialLinks, messages, unreadMessages, recentActivity] =
    await Promise.all([
      prisma.project.count(),
      prisma.writeup.count(),
      prisma.skill.count(),
      prisma.achievement.count(),
      prisma.certificate.count(),
      prisma.socialLink.count(),
      prisma.message.count(),
      prisma.message.count({ where: { read: false } }),
      prisma.activityLog.findMany({ orderBy: { createdAt: "desc" }, take: 10 }),
    ]);

  return res.json({
    projects,
    writeups,
    skills,
    achievements,
    certificates,
    socialLinks,
    messages,
    unreadMessages,
    recentActivity,
  });
});