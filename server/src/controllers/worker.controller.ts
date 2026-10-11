import type { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { acceptJobForWorker } from "../services/engagement.service";

function asString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

export async function acceptJob(req: Request, res: Response) {
  const workerId = req.currentUser!.id;
  const jobId = asString(req.params.jobId);

  const result = await acceptJobForWorker(workerId, jobId);

  if (!result.success) {
    return res.status(result.statusCode).json({ message: result.message });
  }

  return res.status(result.statusCode).json({ engagement: result.engagement });
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
