import { Role } from "@prisma/client";
import type { Request, Response } from "express";
import { clerkClient } from "../lib/clerk";
import { prisma } from "../lib/prisma";

function isRole(value: unknown): value is Role {
  return typeof value === "string" && Object.values(Role).includes(value as Role);
}

function getPrimaryEmail(user: Awaited<ReturnType<typeof clerkClient.users.getUser>>) {
  const primaryEmail = user.emailAddresses.find(
    (email) => email.id === user.primaryEmailAddressId,
  );

  return primaryEmail?.emailAddress ?? user.emailAddresses[0]?.emailAddress;
}

function getDisplayName(user: Awaited<ReturnType<typeof clerkClient.users.getUser>>) {
  const fullName = [user.firstName, user.lastName].filter(Boolean).join(" ").trim();

  return fullName || user.username || "User";
}

export async function syncUser(req: Request, res: Response) {
  if (!req.auth?.userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const { role } = req.body as { role?: unknown };

  if (!isRole(role)) {
    return res.status(400).json({ message: "role must be HIRER or WORKER" });
  }

  const clerkUser = await clerkClient.users.getUser(req.auth.userId);
  const email = getPrimaryEmail(clerkUser);

  if (!email) {
    return res.status(400).json({ message: "Clerk user does not have an email address" });
  }

  const user = await prisma.user.upsert({
    where: { clerkId: req.auth.userId },
    create: {
      clerkId: req.auth.userId,
      email,
      name: getDisplayName(clerkUser),
      role,
    },
    update: {
      email,
      name: getDisplayName(clerkUser),
    },
    select: {
      id: true,
      clerkId: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return res.status(200).json({ user });
}

export async function getMe(req: Request, res: Response) {
  if (!req.auth?.userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const user = await prisma.user.findUnique({
    where: { clerkId: req.auth.userId },
    select: {
      id: true,
      clerkId: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    return res.status(404).json({ message: "User profile not found" });
  }

  return res.status(200).json({ user });
}
