import { z } from "zod";
import type { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { clerkClient } from "../lib/clerk";
import { CITY_NAMES } from "../data/cities";

// ── Zod schema ─────────────────────────────────────────────────────────────
const patchUserSchema = z
  .object({
    name: z.string().min(1).max(200).optional(),
    role: z.enum(["HIRER", "WORKER"]).optional(),
    roleTitle: z.string().min(1).max(100).optional(),
    bio: z.string().max(2000).optional(),
    hourlyRate: z.number().int().nonnegative().optional(),
    languages: z.array(z.string()).optional(),
    skills: z.array(z.string()).optional(),
    documents: z.record(z.string(), z.unknown()).optional(),
    country: z.string().optional(),
    addressLine1: z.string().optional(),
    addressLine2: z.string().optional(),
    city: z
      .string()
      .refine((v) => CITY_NAMES.includes(v), {
        message: `city must be one of: ${CITY_NAMES.join(", ")}`,
      })
      .optional(),
    onboardingComplete: z.boolean().optional(),
  })
  .strict();

// ── Helpers ────────────────────────────────────────────────────────────────
const USER_SELECT = {
  id: true,
  clerkId: true,
  email: true,
  name: true,
  role: true,
  roleTitle: true,
  bio: true,
  hourlyRate: true,
  languages: true,
  skills: true,
  documents: true,
  country: true,
  addressLine1: true,
  addressLine2: true,
  city: true,
  onboardingComplete: true,
  createdAt: true,
  updatedAt: true,
} as const;

// ── Controllers ────────────────────────────────────────────────────────────

export async function patchUser(req: Request, res: Response) {
  const parse = patchUserSchema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({
      message: "Validation failed",
      errors: parse.error.issues.map((e) => ({
        field: e.path.join("."),
        message: e.message,
      })),
    });
  }

  const updates = parse.data;

  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ message: "No valid fields to update" });
  }

  // ── One-role enforcement ──
  if (updates.role !== undefined) {
    const currentUser = await prisma.user.findUnique({
      where: { clerkId: req.auth!.userId },
      select: { role: true, onboardingComplete: true },
    });

    if (currentUser?.role && currentUser.onboardingComplete) {
      return res.status(403).json({
        message:
          "Your role cannot be changed after onboarding is complete. " +
          "Please contact support at support@buildup.app to request a role change.",
        code: "ROLE_LOCKED",
      });
    }
  }

  try {
    const existing = await prisma.user.findUnique({
      where: { clerkId: req.auth!.userId },
      select: { id: true },
    });

    let user;

    if (existing) {
      // Spread only known Prisma-compatible fields
      const { documents, ...rest } = updates;
      user = await prisma.user.update({
        where: { clerkId: req.auth!.userId },
        data: {
          ...rest,
          // Prisma requires InputJsonValue for Json columns
          ...(documents !== undefined ? { documents: documents as object } : {}),
        },
        select: USER_SELECT,
      });
    } else {
      // User not yet in DB — create them now (edge case: sync missed)
      const clerkUser = await clerkClient.users.getUser(req.auth!.userId);
      const primaryEmail = clerkUser.emailAddresses.find(
        (e) => e.id === clerkUser.primaryEmailAddressId,
      );
      const email =
        primaryEmail?.emailAddress ??
        clerkUser.emailAddresses[0]?.emailAddress ??
        "";
      const name =
        [clerkUser.firstName, clerkUser.lastName]
          .filter(Boolean)
          .join(" ")
          .trim() || "User";

      const { documents, ...rest } = updates;
      user = await prisma.user.create({
        data: {
          clerkId: req.auth!.userId,
          email,
          name,
          ...rest,
          ...(documents !== undefined ? { documents: documents as object } : {}),
        },
        select: USER_SELECT,
      });
    }

    return res.status(200).json({ user });
  } catch (error) {
    console.error("Failed to update user profile:", error);
    return res.status(500).json({ message: "Failed to save profile" });
  }
}

export async function getUserReviews(req: Request, res: Response) {
  const userId = (req.params as { id?: string }).id ?? "";

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
