import { Prisma } from "@prisma/client";
import type { BudgetType, JobCategory } from "@prisma/client";
import type { Request, Response } from "express";
import { prisma } from "../lib/prisma";

const VALID_STATUSES = ["OPEN", "CLOSED", "FILLED"] as const;
const VALID_CATEGORIES = [
  "CARPENTER", "ELECTRICIAN", "PLUMBER", "PAINTER", "CLEANER",
  "GARDENER", "MASON", "DRIVER", "COOK", "SECURITY", "OTHER",
] as const;
const VALID_BUDGET_TYPES = ["HOURLY", "DAILY", "FIXED"] as const;

const JOB_REQUIRED_FIELDS = [
  "title", "description", "location", "budget", "budgetType",
  "experience", "category", "startDate", "minWage",
] as const;

function isEnum<T extends string>(valid: readonly T[], value: unknown): value is T {
  return typeof value === "string" && valid.includes(value as T);
}

function asString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function parsePagination(query: Record<string, unknown>) {
  const page = Math.max(1, parseInt(asString(query.page) || "1", 10));
  const limit = Math.min(100, Math.max(1, parseInt(asString(query.limit) || "10", 10)));
  return { page, limit, skip: (page - 1) * limit };
}

function formatJob<T extends Record<string, unknown>>(job: T): T {
  if (job && typeof job.budget === "object" && job.budget !== null) {
    return { ...job, budget: Number(job.budget) };
  }
  return job;
}

export async function listJobs(req: Request, res: Response) {
  const { page, limit, skip } = parsePagination(req.query);
  const status = asString(req.query.status) || undefined;
  const category = asString(req.query.category) || undefined;
  const location = asString(req.query.location) || undefined;

  const where: Prisma.JobWhereInput = {};

  if (status && isEnum(VALID_STATUSES, status)) {
    where.status = status;
  }
  if (category && isEnum(VALID_CATEGORIES, category)) {
    where.category = category;
  }
  if (location) {
    where.location = { contains: location, mode: "insensitive" };
  }

  const [jobs, total] = await Promise.all([
    prisma.job.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        hirer: {
          select: { id: true, name: true, email: true },
        },
      },
    }),
    prisma.job.count({ where }),
  ]);

  return res.status(200).json({
    jobs: jobs.map(formatJob),
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
}

export async function getJob(req: Request, res: Response) {
  const id = asString(req.params.id);

  const job = await prisma.job.findUnique({
    where: { id },
    include: {
      hirer: {
        select: { id: true, name: true, email: true },
      },
    },
  });

  if (!job) {
    return res.status(404).json({ message: "Job not found" });
  }

  return res.status(200).json({ job: formatJob(job) });
}

export async function createJob(req: Request, res: Response) {
  const body = req.body as Record<string, unknown>;

  for (const field of JOB_REQUIRED_FIELDS) {
    if (body[field] === undefined || body[field] === null) {
      return res.status(400).json({ message: `${field} is required` });
    }
  }

  if (!isEnum(VALID_CATEGORIES, body.category)) {
    return res.status(400).json({ message: `category must be one of: ${VALID_CATEGORIES.join(", ")}` });
  }

  if (!isEnum(VALID_BUDGET_TYPES, body.budgetType)) {
    return res.status(400).json({ message: `budgetType must be one of: ${VALID_BUDGET_TYPES.join(", ")}` });
  }

  if (typeof body.budget !== "number" || body.budget <= 0) {
    return res.status(400).json({ message: "budget must be a positive number" });
  }

  if (typeof body.minWage !== "number" || body.minWage <= 0) {
    return res.status(400).json({ message: "minWage must be a positive number" });
  }

  const positions = body.positions !== undefined ? Number(body.positions) : 1;
  if (!Number.isInteger(positions) || positions < 1) {
    return res.status(400).json({ message: "positions must be a positive integer" });
  }

  if (body.budget < body.minWage * positions) {
    return res.status(400).json({
      message: `budget (${body.budget}) must be at least minWage (${body.minWage}) × positions (${positions}) = ${body.minWage * positions}`,
    });
  }

  if (typeof body.experience !== "number" || body.experience < 0) {
    return res.status(400).json({ message: "experience must be a non-negative number" });
  }

  const startDate = new Date(asString(body.startDate));
  if (isNaN(startDate.getTime())) {
    return res.status(400).json({ message: "startDate must be a valid date" });
  }

  let endDate: Date | null = null;
  if (body.endDate) {
    endDate = new Date(asString(body.endDate));
    if (isNaN(endDate.getTime())) {
      return res.status(400).json({ message: "endDate must be a valid date" });
    }
  }

  const job = await prisma.job.create({
    data: {
      title: asString(body.title),
      description: asString(body.description),
      location: asString(body.location),
      budget: body.budget as number,
      budgetType: body.budgetType as BudgetType,
      minWage: body.minWage as number,
      experience: body.experience as number,
      category: body.category as JobCategory,
      startDate,
      endDate,
      positions,
      hirerId: req.currentUser!.id,
    },
    include: {
      hirer: {
        select: { id: true, name: true, email: true },
      },
    },
  });

  return res.status(201).json({ job: formatJob(job) });
}

export async function updateJob(req: Request, res: Response) {
  const id = asString(req.params.id);
  const userId = req.currentUser!.id;

  const existing = await prisma.job.findUnique({
    where: { id },
    select: { hirerId: true },
  });

  if (!existing) {
    return res.status(404).json({ message: "Job not found" });
  }

  if (existing.hirerId !== userId) {
    return res.status(403).json({ message: "Forbidden" });
  }

  const body = req.body as Record<string, unknown>;
  const data: Prisma.JobUpdateInput = {};

  if (body.title !== undefined) data.title = asString(body.title);
  if (body.description !== undefined) data.description = asString(body.description);
  if (body.location !== undefined) data.location = asString(body.location);
  if (body.budget !== undefined) {
    if (typeof body.budget !== "number" || body.budget <= 0) {
      return res.status(400).json({ message: "budget must be a positive number" });
    }
    data.budget = body.budget;
  }
  if (body.minWage !== undefined) {
    if (typeof body.minWage !== "number" || body.minWage <= 0) {
      return res.status(400).json({ message: "minWage must be a positive number" });
    }
    data.minWage = body.minWage;
  }
  if (body.budgetType !== undefined) {
    if (!isEnum(VALID_BUDGET_TYPES, body.budgetType)) {
      return res.status(400).json({ message: `budgetType must be one of: ${VALID_BUDGET_TYPES.join(", ")}` });
    }
    data.budgetType = body.budgetType;
  }
  if (body.experience !== undefined) {
    if (typeof body.experience !== "number" || body.experience < 0) {
      return res.status(400).json({ message: "experience must be a non-negative number" });
    }
    data.experience = body.experience;
  }
  if (body.positions !== undefined) {
    const p = Number(body.positions);
    if (!Number.isInteger(p) || p < 1) {
      return res.status(400).json({ message: "positions must be a positive integer" });
    }
    data.positions = p;
  }
  if (body.category !== undefined) {
    if (!isEnum(VALID_CATEGORIES, body.category)) {
      return res.status(400).json({ message: `category must be one of: ${VALID_CATEGORIES.join(", ")}` });
    }
    data.category = body.category;
  }
  if (body.startDate !== undefined) {
    const d = new Date(asString(body.startDate));
    if (isNaN(d.getTime())) {
      return res.status(400).json({ message: "startDate must be a valid date" });
    }
    data.startDate = d;
  }
  if (body.endDate !== undefined) {
    if (body.endDate === null) {
      data.endDate = null;
    } else {
      const d = new Date(asString(body.endDate));
      if (isNaN(d.getTime())) {
        return res.status(400).json({ message: "endDate must be a valid date" });
      }
      data.endDate = d;
    }
  }
  if (body.status !== undefined) {
    if (!isEnum(VALID_STATUSES, body.status)) {
      return res.status(400).json({ message: `status must be one of: ${VALID_STATUSES.join(", ")}` });
    }
    data.status = body.status;
  }

  const job = await prisma.job.update({
    where: { id },
    data,
    include: {
      hirer: {
        select: { id: true, name: true, email: true },
      },
    },
  });

  return res.status(200).json({ job: formatJob(job) });
}

export async function deleteJob(req: Request, res: Response) {
  const id = asString(req.params.id);
  const userId = req.currentUser!.id;

  const existing = await prisma.job.findUnique({
    where: { id },
    select: { hirerId: true },
  });

  if (!existing) {
    return res.status(404).json({ message: "Job not found" });
  }

  if (existing.hirerId !== userId) {
    return res.status(403).json({ message: "Forbidden" });
  }

  await prisma.job.delete({ where: { id } });

  return res.status(200).json({ message: "Job deleted" });
}
