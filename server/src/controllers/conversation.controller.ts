import type { Request, Response } from "express";
import { prisma } from "../lib/prisma";

function asString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

export async function createOrFindConversation(req: Request, res: Response) {
  const clerkUserId = req.auth?.userId;
  if (!clerkUserId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const currentUser = await prisma.user.findUnique({
    where: { clerkId: clerkUserId },
    select: { id: true, role: true },
  });

  if (!currentUser) {
    return res.status(404).json({ message: "User not found" });
  }

  const { jobId } = req.body as { jobId?: string };
  if (!jobId) {
    return res.status(400).json({ message: "jobId is required" });
  }

  const job = await prisma.job.findUnique({
    where: { id: jobId },
    select: { id: true, hirerId: true },
  });

  if (!job) {
    return res.status(404).json({ message: "Job not found" });
  }

  const hirerId = job.hirerId;
  const workerId = currentUser.id;

  const existing = await prisma.conversation.findUnique({
    where: { jobId_workerId: { jobId, workerId } },
    include: {
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  });

  if (existing) {
    return res.status(200).json({ conversation: existing });
  }

  const conversation = await prisma.conversation.create({
    data: { jobId, hirerId, workerId },
    include: { messages: true },
  });

  return res.status(201).json({ conversation });
}

export async function listConversations(req: Request, res: Response) {
  const clerkUserId = req.auth?.userId;
  if (!clerkUserId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const currentUser = await prisma.user.findUnique({
    where: { clerkId: clerkUserId },
    select: { id: true },
  });

  if (!currentUser) {
    return res.status(404).json({ message: "User not found" });
  }

  const userId = currentUser.id;

  const conversations = await prisma.conversation.findMany({
    where: {
      OR: [{ hirerId: userId }, { workerId: userId }],
    },
    include: {
      job: { select: { id: true, title: true } },
      hirer: { select: { id: true, name: true } },
      worker: { select: { id: true, name: true } },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return res.status(200).json({ conversations });
}

export async function getConversationMessages(req: Request, res: Response) {
  const clerkUserId = req.auth?.userId;
  if (!clerkUserId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const currentUser = await prisma.user.findUnique({
    where: { clerkId: clerkUserId },
    select: { id: true },
  });

  if (!currentUser) {
    return res.status(404).json({ message: "User not found" });
  }

  const conversationId = asString(req.params.id);

  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    select: { hirerId: true, workerId: true },
  });

  if (!conversation) {
    return res.status(404).json({ message: "Conversation not found" });
  }

  const userId = currentUser.id;
  if (conversation.hirerId !== userId && conversation.workerId !== userId) {
    return res.status(403).json({ message: "Forbidden" });
  }

  const messages = await prisma.message.findMany({
    where: { conversationId },
    include: {
      sender: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  return res.status(200).json({ messages, currentUserId: userId });
}

export async function sendMessage(req: Request, res: Response) {
  const clerkUserId = req.auth?.userId;
  if (!clerkUserId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const currentUser = await prisma.user.findUnique({
    where: { clerkId: clerkUserId },
    select: { id: true },
  });

  if (!currentUser) {
    return res.status(404).json({ message: "User not found" });
  }

  const { conversationId, content } = req.body as {
    conversationId?: string;
    content?: string;
  };

  if (!conversationId || !content || !content.trim()) {
    return res.status(400).json({ message: "conversationId and content are required" });
  }

  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    select: { hirerId: true, workerId: true },
  });

  if (!conversation) {
    return res.status(404).json({ message: "Conversation not found" });
  }

  const userId = currentUser.id;
  if (conversation.hirerId !== userId && conversation.workerId !== userId) {
    return res.status(403).json({ message: "Forbidden" });
  }

  const message = await prisma.message.create({
    data: {
      conversationId,
      senderId: userId,
      content: content.trim(),
    },
    include: {
      sender: { select: { id: true, name: true } },
    },
  });

  return res.status(201).json({ message });
}
