import type { NextFunction, Request, Response } from "express";
import type { ZodTypeAny } from "zod";

/**
 * Generic Zod validation middleware.
 * Usage: router.post("/route", validate(mySchema), controller)
 */
export function validate(schema: ZodTypeAny) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const errors = result.error.issues.map((e) => ({
        field: e.path.join("."),
        message: e.message,
      }));
      return res.status(400).json({ message: "Validation failed", errors });
    }
    req.body = result.data as unknown;
    return next();
  };
}
