import { z } from "zod";
import type { Request, Response } from "express";
import { prisma } from "../lib/prisma";

// ── Zod schemas ────────────────────────────────────────────────────────────
const updateEngagementSchema = z.object({
  status: z.enum(["COMPLETED", "CANCELLED"]),
  cancellationReason: z.string().max(500).optional(),
});

const createReviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(1000).optional(),
});


export async function updateEngagement(req: Request, res: Response) {
  const engagementId = (req.params as { id?: string }).id ?? "";

  const parse = updateEngagementSchema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({
      message: "Validation failed",
      errors: parse.error.issues.map((e) => ({
        field: e.path.join("."),
        message: e.message,
      })),
    });
  }

  const currentUser = await prisma.user.findUnique({
    where: { clerkId: req.auth!.userId },
    select: { id: true },
  });

  if (!currentUser) {
    return res.status(404).json({ message: "User not found" });
  }

  const userId = currentUser.id;
  const { status, cancellationReason } = parse.data;

  const { updateEngagementWithCancelOrComplete } = await import("../services/cancel.service");
  const result = await updateEngagementWithCancelOrComplete(
    engagementId,
    userId,
    status,
    cancellationReason,
  );

  if (!result.success) {
    return res.status(result.statusCode).json({ message: result.message });
  }

  return res.status(result.statusCode).json({ engagement: result.engagement });
}

export async function createReview(req: Request, res: Response) {
  const engagementId = (req.params as { id?: string }).id ?? "";

  const parse = createReviewSchema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({
      message: "Validation failed",
      errors: parse.error.issues.map((e) => ({
        field: e.path.join("."),
        message: e.message,
      })),
    });
  }

  const currentUser = await prisma.user.findUnique({
    where: { clerkId: req.auth!.userId },
    select: { id: true },
  });

  if (!currentUser) {
    return res.status(404).json({ message: "User not found" });
  }

  const userId = currentUser.id;
  const { rating, comment } = parse.data;

  const engagement = await prisma.engagement.findUnique({
    where: { id: engagementId },
    include: { job: { select: { hirerId: true } } },
  });

  if (!engagement) {
    return res.status(404).json({ message: "Engagement not found" });
  }

  if (engagement.status !== "COMPLETED") {
    return res.status(409).json({ message: "Can only review completed engagements" });
  }

  const isWorker = engagement.workerId === userId;
  const isHirer = engagement.job.hirerId === userId;

  if (!isWorker && !isHirer) {
    return res.status(403).json({ message: "Forbidden" });
  }

  const subjectId = isWorker ? engagement.job.hirerId : engagement.workerId;

  const existing = await prisma.review.findUnique({
    where: {
      engagementId_authorId_subjectId: {
        engagementId,
        authorId: userId,
        subjectId,
      },
    },
  });

  if (existing) {
    return res.status(409).json({ message: "You have already reviewed this engagement" });
  }

  const review = await prisma.review.create({
    data: {
      rating,
      comment: comment ?? null,
      jobId: engagement.jobId,
      engagementId,
      authorId: userId,
      subjectId,
    },
    include: {
      author: { select: { id: true, name: true } },
      subject: { select: { id: true, name: true } },
    },
  });

  return res.status(201).json({ review });
}
