
import type { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { z } from "zod";

function asString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

const createConversationSchema = z.object({
  jobId: z.string().min(1),
  workerId: z.string().min(1).optional(),
});

const sendMessageSchema = z.object({
  content: z.string().trim().min(1).max(2000),
});

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

  const parse = createConversationSchema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({
      message: "Validation failed",
      errors: parse.error.issues.map((e) => ({
        field: e.path.join("."),
        message: e.message,
      })),
    });
  }

  const { jobId, workerId: requestedWorkerId } = parse.data;

  const job = await prisma.job.findUnique({
    where: { id: jobId },
    select: { id: true, hirerId: true },
  });

  if (!job) {
    return res.status(404).json({ message: "Job not found" });
  }

  const hirerId = job.hirerId;
  let workerId: string;

  if (currentUser.role === "WORKER" || (!currentUser.role && !requestedWorkerId)) {
    workerId = currentUser.id;
  } else if (currentUser.role === "HIRER" || requestedWorkerId) {
    if (currentUser.id !== job.hirerId) {
      return res.status(403).json({ message: "Forbidden" });
    }
    if (!requestedWorkerId) {
      return res.status(400).json({ message: "workerId is required" });
    }
    workerId = requestedWorkerId;
    const engagement = await prisma.engagement.findFirst({
      where: { jobId, workerId },
      select: { id: true },
    });
    if (!engagement) {
      return res.status(400).json({ message: "Worker does not have an engagement on this job" });
    }
  } else {
    workerId = currentUser.id;
  }

  if (hirerId === workerId) {
    return res.status(400).json({ message: "Cannot create conversation with yourself" });
  }

  try {
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
  } catch (error: any) {
    if (error.code === "P2002" || error.code === "23505") {
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
    }
    throw error;
  }
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
  });

  conversations.sort((a, b) => {
    const aTime = a.messages[0]?.createdAt ?? a.createdAt;
    const bTime = b.messages[0]?.createdAt ?? b.createdAt;
    return new Date(bTime).getTime() - new Date(aTime).getTime();
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

  const after = asString(req.query.after);
  const where: any = { conversationId };
  if (after) {
    const afterDate = new Date(after);
    if (!isNaN(afterDate.getTime())) {
      where.createdAt = { gt: afterDate };
    }
  }
  const messages = await prisma.message.findMany({
    where,
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

  const conversationIdFromBody = (req.body as any)?.conversationId;
  const conversationId = asString(req.params.id) || asString(conversationIdFromBody);
  const contentRaw = (req.body as any)?.content;

  const parse = sendMessageSchema.safeParse({ content: contentRaw });
  if (!parse.success || !conversationId) {
    return res.status(400).json({
      message: "Validation failed",
      errors: parse.success ? [] : parse.error.issues.map((e) => ({ field: e.path.join("."), message: e.message })),
    });
  }

  const content = parse.data.content;

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
      content,
    },
    include: {
      sender: { select: { id: true, name: true } },
    },
  });

  return res.status(201).json({ message });
}
