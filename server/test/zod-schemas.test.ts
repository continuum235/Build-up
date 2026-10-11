import { describe, expect, it } from "vitest";
import { z } from "zod";

const JOB_CATEGORIES = [
  "CARPENTER", "ELECTRICIAN", "PLUMBER", "PAINTER", "CLEANER",
  "GARDENER", "MASON", "DRIVER", "COOK", "SECURITY", "OTHER",
] as const;

const JOB_BUDGET_TYPES = ["HOURLY", "DAILY", "FIXED"] as const;

const createJobSchema = z
  .object({
    budget: z.number().positive(),
    minWage: z.number().positive(),
    positions: z.number().int().positive().default(1),
  })
  .refine((d) => d.budget >= d.minWage * d.positions, {
    message: "budget must be at least minWage × positions",
    path: ["budget"],
  });

describe("Zod schemas", () => {
  it("validates budget rule", () => {
    const result = createJobSchema.safeParse({
      budget: 1000,
      minWage: 500,
      positions: 2,
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid budget", () => {
    const result = createJobSchema.safeParse({
      budget: 500,
      minWage: 500,
      positions: 2,
    });
    expect(result.success).toBe(false);
  });
});
