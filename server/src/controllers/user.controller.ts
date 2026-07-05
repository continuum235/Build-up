import type { Request, Response } from "express";
import { prisma } from "../lib/prisma";

function asString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

export async function getUserReviews(req: Request, res: Response) {
  const userId = asString(req.params.id);

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true },
  });

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const reviews = await prisma.review.findMany({
    where: { subjectId: userId },
    include: {
      author: { select: { id: true, name: true } },
      job: { select: { id: true, title: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return res.status(200).json({ reviews });
}
