import type { Role } from "@prisma/client";
import type { NextFunction, Request, Response } from "express";
import { prisma } from "../lib/prisma";

export function requireRole(role: Role) {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.auth?.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: req.auth.userId },
      select: {
        id: true,
        clerkId: true,
        email: true,
        name: true,
        role: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User profile not found" });
    }

    if (user.role !== role) {
      return res.status(403).json({ message: "Forbidden" });
    }

    req.currentUser = user;
    return next();
  };
}
