import { z } from "zod";
import { Role } from "@prisma/client";
import type { Request, Response } from "express";
import { clerkClient } from "../lib/clerk";
import { prisma } from "../lib/prisma";

// ── Zod schemas ────────────────────────────────────────────────────────────
const syncSchema = z.object({
  role: z.enum(["HIRER", "WORKER"]).optional(),
});

// ── Helpers ────────────────────────────────────────────────────────────────
function getPrimaryEmail(
  user: Awaited<ReturnType<typeof clerkClient.users.getUser>>,
) {
  const primary = user.emailAddresses.find(
    (e) => e.id === user.primaryEmailAddressId,
  );
  return primary?.emailAddress ?? user.emailAddresses[0]?.emailAddress;
}

function getDisplayName(
  user: Awaited<ReturnType<typeof clerkClient.users.getUser>>,
) {
  const full = [user.firstName, user.lastName].filter(Boolean).join(" ").trim();
  return full || user.username || "User";
}

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

export async function syncUser(req: Request, res: Response) {
  try {
    const parse = syncSchema.safeParse(req.body);
    if (!parse.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: parse.error.issues.map((e) => ({
          field: e.path.join("."),
          message: e.message,
        })),
      });
    }

    const { role } = parse.data;
    const clerkUser = await clerkClient.users.getUser(req.auth!.userId);
    const email = getPrimaryEmail(clerkUser);

    if (!email) {
      return res
        .status(400)
        .json({ message: "Clerk user does not have an email address" });
    }

    // Fetch current user to prevent role from being overwritten after onboarding
    const existing = await prisma.user.findUnique({
      where: { clerkId: req.auth!.userId },
      select: { role: true },
    });

    const user = await prisma.user.upsert({
      where: { clerkId: req.auth!.userId },
      create: {
        clerkId: req.auth!.userId,
        email,
        name: getDisplayName(clerkUser),
        ...(role ? { role: role as Role } : {}),
      },
      update: {
        email,
        name: getDisplayName(clerkUser),
        // Only set role if not already assigned (one-role enforcement)
        ...(role && !existing?.role ? { role: role as Role } : {}),
      },
      select: USER_SELECT,
    });

    return res.status(200).json({ user });
  } catch (err) {
    console.error("syncUser error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function getMe(req: Request, res: Response) {
  try {
    const user = await prisma.user.findUnique({
      where: { clerkId: req.auth!.userId },
      select: USER_SELECT,
    });

    if (!user) {
      return res.status(404).json({ message: "User profile not found" });
    }

    return res.status(200).json({ user });
  } catch (err) {
    console.error("getMe error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
}
