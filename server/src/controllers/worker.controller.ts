import type { Request, Response } from "express";
import { prisma } from "../lib/prisma";

function asString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

export async function acceptJob(req: Request, res: Response) {
  const workerId = req.currentUser!.id;
  const jobId = asString(req.params.jobId);

  const job = await prisma.job.findUnique({
    where: { id: jobId },
    select: { id: true, status: true, positions: true, filledCount: true },
  });

  if (!job) {
    return res.status(404).json({ message: "Job not found" });
  }

  if (job.status !== "OPEN") {
    return res.status(409).json({ message: "Job is not open for acceptance" });
  }

  if (job.filledCount >= job.positions) {
    return res.status(409).json({ message: "All positions for this job are filled" });
  }

  const activeEngagement = await prisma.engagement.findFirst({
    where: { workerId, status: "ACTIVE" },
    select: { id: true },
  });

  if (activeEngagement) {
    return res.status(409).json({ message: "You already have an active engagement" });
  }

  const existingDismissal = await prisma.jobDismissal.findUnique({
    where: { workerId_jobId: { workerId, jobId } },
  });

  if (existingDismissal) {
    return res.status(409).json({ message: "Cannot accept a job you have rejected" });
  }

  const newFilledCount = job.filledCount + 1;
  const shouldClose = newFilledCount >= job.positions;

  await prisma.$transaction([
    prisma.engagement.create({ data: { workerId, jobId } }),
    prisma.job.update({
      where: { id: jobId },
      data: {
        filledCount: newFilledCount,
        ...(shouldClose ? { status: "FILLED" } : {}),
      },
    }),
  ]);

  const engagement = await prisma.engagement.findFirst({
    where: { workerId, jobId },
    include: {
      job: {
        include: {
          hirer: { select: { id: true, name: true } },
        },
      },
    },
  });

  return res.status(201).json({ engagement });
}

export async function rejectJob(req: Request, res: Response) {
  const workerId = req.currentUser!.id;
  const jobId = asString(req.params.jobId);

  const job = await prisma.job.findUnique({
    where: { id: jobId },
    select: { id: true, status: true },
  });

  if (!job) {
    return res.status(404).json({ message: "Job not found" });
  }

  if (job.status !== "OPEN") {
    return res.status(409).json({ message: "Job is not open for rejection" });
  }

  const existing = await prisma.jobDismissal.findUnique({
    where: { workerId_jobId: { workerId, jobId } },
  });

  if (existing) {
    return res.status(409).json({ message: "Job already rejected" });
  }

  const dismissal = await prisma.jobDismissal.create({
    data: { workerId, jobId },
  });

  return res.status(201).json({ dismissal });
}

export async function getMyWorkerJobs(req: Request, res: Response) {
  const workerId = req.currentUser!.id;

  const engagements = await prisma.engagement.findMany({
    where: { workerId },
    include: {
      job: {
        include: {
          hirer: { select: { id: true, name: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const engagedJobIds = engagements.map((e) => e.jobId);

  const dismissedRows = await prisma.jobDismissal.findMany({
    where: { workerId },
    select: { jobId: true },
  });

  const excludedJobIds = [
    ...engagedJobIds,
    ...dismissedRows.map((d) => d.jobId),
  ];

  const openJobs = await prisma.job.findMany({
    where: {
      status: "OPEN",
      id: { notIn: excludedJobIds },
    },
    include: {
      hirer: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return res.status(200).json({
    engagements,
    openJobs,
    dismissedJobIds: dismissedRows.map((d) => d.jobId),
  });
}
