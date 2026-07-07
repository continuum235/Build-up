import type { EngagementStatus } from "@prisma/client";
import type { Request, Response } from "express";
import { prisma } from "../lib/prisma";

function asString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

export async function updateEngagement(req: Request, res: Response) {
  const engagementId = asString(req.params.id);
  const userId = req.currentUser!.id;
  const { status } = req.body as { status?: string };

  if (!status || !["COMPLETED", "CANCELLED"].includes(status)) {
    return res.status(400).json({ message: "status must be COMPLETED or CANCELLED" });
  }

  const engagement = await prisma.engagement.findUnique({
    where: { id: engagementId },
    include: { job: { select: { hirerId: true } } },
  });

  if (!engagement) {
    return res.status(404).json({ message: "Engagement not found" });
  }

  if (engagement.status !== "ACTIVE") {
    return res.status(409).json({ message: "Engagement is not active" });
  }

  const isWorker = engagement.workerId === userId;
  const isHirer = engagement.job.hirerId === userId;

  if (!isWorker && !isHirer) {
    return res.status(403).json({ message: "Forbidden" });
  }

  const updates = [
    prisma.engagement.update({
      where: { id: engagementId },
      data: { status: status as EngagementStatus },
    }),
  ];

  if (status === "CANCELLED") {
    updates.push(
      prisma.job.update({
        where: { id: engagement.jobId },
        data: { status: "OPEN" },
      }) as never,
    );
  }

  await prisma.$transaction(updates);

  const updated = await prisma.engagement.findUnique({
    where: { id: engagementId },
    include: {
      job: { select: { id: true, title: true, status: true } },
      worker: { select: { id: true, name: true } },
    },
  });

  return res.status(200).json({ engagement: updated });
}

export async function createReview(req: Request, res: Response) {
  const engagementId = asString(req.params.id);
  const userId = req.currentUser!.id;
  const body = req.body as Record<string, unknown>;
  const rating = body.rating;
  const comment = body.comment;

  if (typeof rating !== "number" || !Number.isInteger(rating) || rating < 1 || rating > 5) {
    return res.status(400).json({ message: "rating must be an integer between 1 and 5" });
  }

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
      comment: typeof comment === "string" && comment.length > 0 ? comment : null,
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
