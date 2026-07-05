import type { Request, Response } from "express";
import { prisma } from "../lib/prisma";

export async function getMyHirerJobs(req: Request, res: Response) {
  const hirerId = req.currentUser!.id;

  const jobs = await prisma.job.findMany({
    where: { hirerId },
    include: {
      engagement: {
        include: {
          worker: { select: { id: true, name: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return res.status(200).json({ jobs });
}
