import type { NextFunction, Request, Response } from "express";
import type { ZodSchema } from "zod";

/**
 * Validates req.body against a zod schema. On failure responds 400
 * with a single human-readable message.
 */
export function validateBody(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const first = result.error.errors[0];
      const message = first
        ? `${first.path.join(".") || "body"}: ${first.message}`
        : "Invalid input";
      return res.status(400).json({ message });
    }
    req.body = result.data;
    return next();
  };
}