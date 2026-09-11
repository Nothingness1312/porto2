import type { Prisma } from "@prisma/client";
import { prisma } from "../prisma.js";

export async function logActivity(
  action: "create" | "update" | "delete",
  entity: string,
  entityId?: string,
  metadata?: Prisma.InputJsonValue
): Promise<void> {
  try {
    await prisma.activityLog.create({
      data: { action, entity, entityId, metadata },
    });
  } catch (err) {
    // Logging must never break the main operation
    console.error("activity log failed:", err);
  }
}