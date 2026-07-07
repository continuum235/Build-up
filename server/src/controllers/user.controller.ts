import type { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { clerkClient } from "../lib/clerk";
import { isRole } from "./auth.controller";

function asString(value: unknown): string {
  return typeof value === "string" ? value : "";
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

export async function patchUser(req: Request, res: Response) {
  const userId = req.auth?.userId;
  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const body = req.body as Record<string, unknown>;
  const data: Record<string, unknown> = {};

  if (body.role !== undefined) {
    if (!isRole(body.role)) {
      return res.status(400).json({ message: "role must be HIRER or WORKER" });
    }
    data.role = body.role;
  }

  if (body.roleTitle !== undefined) data.roleTitle = asString(body.roleTitle);
  if (body.bio !== undefined) data.bio = asString(body.bio);

  if (body.hourlyRate !== undefined) {
    const rate = Number(body.hourlyRate);
    if (!Number.isInteger(rate) || rate < 0) {
      return res.status(400).json({ message: "hourlyRate must be a non-negative integer" });
    }
    data.hourlyRate = rate;
  }

  if (body.languages !== undefined) {
    if (!Array.isArray(body.languages)) {
      return res.status(400).json({ message: "languages must be an array" });
    }
    data.languages = body.languages;
  }

  if (body.skills !== undefined) {
    if (!Array.isArray(body.skills)) {
      return res.status(400).json({ message: "skills must be an array" });
    }
    data.skills = body.skills;
  }

  if (body.documents !== undefined) {
    if (typeof body.documents !== "object" || body.documents === null) {
      return res.status(400).json({ message: "documents must be an object" });
    }
    data.documents = body.documents;
  }

  if (body.country !== undefined) data.country = asString(body.country);
  if (body.addressLine1 !== undefined) data.addressLine1 = asString(body.addressLine1);
  if (body.addressLine2 !== undefined) data.addressLine2 = asString(body.addressLine2);
  if (body.city !== undefined) data.city = asString(body.city);

  if (body.onboardingComplete !== undefined) {
    data.onboardingComplete = body.onboardingComplete === true;
  }

  if (Object.keys(data).length === 0) {
    return res.status(400).json({ message: "No valid fields to update" });
  }

  const user = await prisma.user.upsert({
    where: { clerkId: userId },
    create: await (async () => {
      const clerkUser = await clerkClient.users.getUser(userId);
      const primaryEmail = clerkUser.emailAddresses.find(
        (e) => e.id === clerkUser.primaryEmailAddressId,
      );
      return {
        clerkId: userId,
        email: primaryEmail?.emailAddress ?? clerkUser.emailAddresses[0]?.emailAddress ?? "",
        name: [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ").trim() || "User",
        ...data,
      };
    })(),
    update: data,
    select: USER_SELECT,
  });

  return res.status(200).json({ user });
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
