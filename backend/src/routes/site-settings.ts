import { Router, type Request, type Response } from "express";
import { prisma } from "../prisma.js";
import { requireAuth } from "../middleware/auth.js";
import { validateBody } from "../middleware/validate.js";
import { settingUpdateSchema } from "../schemas.js";

export const siteSettingsRouter = Router();

siteSettingsRouter.get("/", async (_req: Request, res: Response) => {
  const settings = await prisma.siteSetting.findMany();
  return res.json(settings);
});

siteSettingsRouter.get("/:key", async (req: Request, res: Response) => {
  const setting = await prisma.siteSetting.findUnique({ where: { key: req.params.key } });
  if (!setting) return res.status(404).json({ message: "Setting not found" });
  return res.json(setting);
});

siteSettingsRouter.put(
  "/:key",
  requireAuth,
  validateBody(settingUpdateSchema),
  async (req: Request, res: Response) => {
    const { key } = req.params;
    const setting = await prisma.siteSetting.upsert({
      where: { key },
      update: { value: req.body.value },
      create: { key, value: req.body.value },
    });
    return res.json(setting);
  }
);