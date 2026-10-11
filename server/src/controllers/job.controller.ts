import { z } from "zod";
import { Prisma } from "@prisma/client";
import type { BudgetType, JobCategory } from "@prisma/client";
import type { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { CITY_NAMES, citiesByProximity } from "../data/cities";

// ── Zod schemas ────────────────────────────────────────────────────────────
const JOB_CATEGORIES = [
  "CARPENTER", "ELECTRICIAN", "PLUMBER", "PAINTER", "CLEANER",
  "GARDENER", "MASON", "DRIVER", "COOK", "SECURITY", "OTHER",
] as const;

const JOB_BUDGET_TYPES = ["HOURLY", "DAILY", "FIXED"] as const;

const createJobSchema = z
  .object({
    title: z.string().min(3).max(200),
    description: z.string().min(10).max(5000),
    location: z
      .string()
      .refine((v) => CITY_NAMES.includes(v), {
        message: `location must be one of: ${CITY_NAMES.join(", ")}`,
      }),
    budget: z.number().positive(),
    budgetType: z.enum(JOB_BUDGET_TYPES),
    minWage: z.number().positive(),
    experience: z.number().int().nonnegative(),
    category: z.enum(JOB_CATEGORIES),
    startDate: z.string().datetime({ offset: true }).or(z.string().date()),
    endDate: z
      .string()
      .datetime({ offset: true })
      .or(z.string().date())
      .optional(),
    positions: z.number().int().positive().default(1),
  })
  .refine((d) => d.budget >= d.minWage * d.positions, {
    message: "budget must be at least minWage × positions",
    path: ["budget"],
  });

const updateJobSchema = z
  .object({
    title: z.string().min(3).max(200).optional(),
    description: z.string().min(10).max(5000).optional(),
    location: z
      .string()
      .refine((v) => CITY_NAMES.includes(v), {
        message: `location must be one of: ${CITY_NAMES.join(", ")}`,
      })
      .optional(),
    budget: z.number().positive().optional(),
    budgetType: z.enum(JOB_BUDGET_TYPES).optional(),
    minWage: z.number().positive().optional(),
    experience: z.number().int().nonnegative().optional(),
    category: z.enum(JOB_CATEGORIES).optional(),
    startDate: z
      .string()
      .datetime({ offset: true })
      .or(z.string().date())
      .optional(),
    endDate: z
      .string()
      .datetime({ offset: true })
      .or(z.string().date())
      .nullable()
      .optional(),
    positions: z.number().int().positive().optional(),
    status: z.enum(["OPEN", "CLOSED", "FILLED"]).optional(),
  })
  .strict();

// ── Helpers ────────────────────────────────────────────────────────────────
function parsePagination(query: Record<string, unknown>) {
  const page = Math.max(1, parseInt(String(query.page ?? "1"), 10));
  const limit = Math.min(
    100,
    Math.max(1, parseInt(String(query.limit ?? "20"), 10)),
  );
  return { page, limit, skip: (page - 1) * limit };
}

function formatJob<T extends Record<string, unknown>>(job: T): T {
  if (job && typeof job.budget === "object" && job.budget !== null) {
    return { ...job, budget: Number(job.budget) };
  }
  return job;
}

/**
 * Sorts a list of jobs by proximity to the user's city.
 * Jobs in the nearest city appear first; unknown locations go to the end.
 */
function sortByProximity(
  jobs: { location: string }[],
  userCity: string,
): typeof jobs {
  const orderedCities = citiesByProximity(userCity);
  const rank = (city: string) => {
    const idx = orderedCities.indexOf(city);
    return idx === -1 ? orderedCities.length : idx;
  };
  return [...jobs].sort((a, b) => rank(a.location) - rank(b.location));
}

// ── Controllers ────────────────────────────────────────────────────────────

export async function listJobs(req: Request, res: Response) {
  const { page, limit, skip } = parsePagination(req.query);
  const status = String(req.query.status ?? "") || undefined;
  const category = String(req.query.category ?? "") || undefined;
  const location = String(req.query.location ?? "") || undefined;
  const userCity = String(req.query.userCity ?? "") || undefined;

  const where: Prisma.JobWhereInput = {};

  const VALID_STATUSES = ["OPEN", "CLOSED", "FILLED"] as const;
  const VALID_CATEGORIES = JOB_CATEGORIES;

  if (status && VALID_STATUSES.includes(status as (typeof VALID_STATUSES)[number])) {
    where.status = status as (typeof VALID_STATUSES)[number];
  }
  if (category && VALID_CATEGORIES.includes(category as JobCategory)) {
    where.category = category as JobCategory;
  }
  if (location) {
    where.location = { contains: location, mode: "insensitive" };
  }

  const total = await prisma.job.count({ where });

  if (userCity && CITY_NAMES.includes(userCity)) {
    const allJobs = await prisma.job.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        hirer: { select: { id: true, name: true } },
      },
    });
    const formatted = allJobs.map(formatJob);
    const sorted = sortByProximity(formatted as { location: string }[], userCity);
    const paginated = sorted.slice(skip, skip + limit);
    return res.status(200).json({
      jobs: paginated,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  }

  const jobs = await prisma.job.findMany({
    where,
    skip,
    take: limit,
    orderBy: { createdAt: "desc" },
    include: {
      hirer: { select: { id: true, name: true } },
    },
  });
  const formatted = jobs.map(formatJob);

  return res.status(200).json({
    jobs: formatted,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
}

export async function getJob(req: Request, res: Response) {
  const id = (req.params as { id?: string }).id ?? "";

  const job = await prisma.job.findUnique({
    where: { id },
    include: {
      hirer: { select: { id: true, name: true } },
    },
  });

  if (!job) {
    return res.status(404).json({ message: "Job not found" });
  }

  return res.status(200).json({ job: formatJob(job as Record<string, unknown>) });
}

export async function createJob(req: Request, res: Response) {
  const parse = createJobSchema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({
      message: "Validation failed",
      errors: parse.error.issues.map((e) => ({
        field: e.path.join("."),
        message: e.message,
      })),
    });
  }

  const d = parse.data;
  const startDate = new Date(d.startDate);
  const endDate = d.endDate ? new Date(d.endDate) : null;

  const job = await prisma.job.create({
    data: {
      title: d.title,
      description: d.description,
      location: d.location,
      budget: d.budget,
      budgetType: d.budgetType as BudgetType,
      minWage: d.minWage,
      experience: d.experience,
      category: d.category as JobCategory,
      startDate,
      endDate,
      positions: d.positions,
      hirerId: req.currentUser!.id,
    },
    include: {
      hirer: { select: { id: true, name: true } },
    },
  });

  return res.status(201).json({ job: formatJob(job as Record<string, unknown>) });
}

export async function updateJob(req: Request, res: Response) {
  const id = (req.params as { id?: string }).id ?? "";
  const userId = req.currentUser!.id;

  const existing = await prisma.job.findUnique({
    where: { id },
    select: { hirerId: true, filledCount: true, positions: true, status: true, budget: true, minWage: true },
  });

  if (!existing) {
    return res.status(404).json({ message: "Job not found" });
  }

  if (existing.hirerId !== userId) {
    return res.status(403).json({ message: "Forbidden" });
  }

  const parse = updateJobSchema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({
      message: "Validation failed",
      errors: parse.error.issues.map((e) => ({
        field: e.path.join("."),
        message: e.message,
      })),
    });
  }

  const d = parse.data;

  const mergedPositions = d.positions ?? existing.positions;
  const mergedFilledCount = existing.filledCount;
  const mergedBudget = d.budget ?? Number(existing.budget);
  const mergedMinWage = d.minWage ?? (existing.minWage ? Number(existing.minWage) : 0);

  if (mergedPositions < mergedFilledCount) {
    return res.status(400).json({ message: "positions cannot be less than filledCount" });
  }

  if (mergedBudget < mergedMinWage * mergedPositions) {
    return res.status(400).json({ message: "budget must be at least minWage × positions" });
  }

  if (d.status === "FILLED") {
    return res.status(409).json({ message: "Cannot set status to FILLED directly" });
  }

  if (d.status === "OPEN" && mergedFilledCount >= mergedPositions) {
    return res.status(409).json({ message: "Cannot reopen a fully filled job" });
  }

  const data: Prisma.JobUpdateInput = { ...d };

  if (d.startDate) data.startDate = new Date(d.startDate);
  if (d.endDate !== undefined) data.endDate = d.endDate ? new Date(d.endDate) : null;

  const job = await prisma.job.update({
    where: { id },
    data,
    include: {
      hirer: { select: { id: true, name: true } },
    },
  });

  return res.status(200).json({ job: formatJob(job as Record<string, unknown>) });
}

export async function deleteJob(req: Request, res: Response) {
  const id = (req.params as { id?: string }).id ?? "";
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

  const activeEngagement = await prisma.engagement.findFirst({
    where: { jobId: id, status: "ACTIVE" },
    select: { id: true },
  });

  if (activeEngagement) {
    return res.status(409).json({ message: "Job has active engagements. Close it instead." });
  }

  await prisma.job.delete({ where: { id } });

  return res.status(200).json({ message: "Job deleted" });
}
