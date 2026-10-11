import { prisma } from "../lib/prisma";

export async function acceptJobForWorker(workerId: string, jobId: string) {
  return await prisma.$transaction(async (tx) => {
    const activeEngagement = await tx.engagement.findFirst({
      where: { workerId, status: "ACTIVE" },
      select: { id: true },
    });

    if (activeEngagement) {
      return {
        success: false,
        statusCode: 409 as const,
        message: "You already have an active engagement",
      };
    }

    const existingDismissal = await tx.jobDismissal.findUnique({
      where: { workerId_jobId: { workerId, jobId } },
      select: { id: true },
    });

    if (existingDismissal) {
      return {
        success: false,
        statusCode: 409 as const,
        message: "Cannot accept a job you have rejected",
      };
    }

    const updateResult = (await tx.$executeRaw`UPDATE "Job" 
       SET "filledCount" = "filledCount" + 1,
           "status" = CASE WHEN "filledCount" + 1 >= "positions" THEN 'FILLED' ELSE "status" END
       WHERE "id" = ${jobId} 
         AND "status" = 'OPEN' 
         AND "filledCount" < "positions"
       RETURNING "id", "status", "filledCount", "positions"`) as unknown as Array<{ id: string; status: string; filledCount: number; positions: number }>;

    if (updateResult.length === 0) {
      const job = await tx.job.findUnique({
        where: { id: jobId },
        select: { status: true, filledCount: true, positions: true },
      });

      if (!job) {
        return {
          success: false,
          statusCode: 404 as const,
          message: "Job not found",
        };
      }

      if (job.status !== "OPEN") {
        return {
          success: false,
          statusCode: 409 as const,
          message: "Job is not open for acceptance",
        };
      }

      if (job.filledCount >= job.positions) {
        return {
          success: false,
          statusCode: 409 as const,
          message: "All positions for this job are filled",
        };
      }

      return {
        success: false,
        statusCode: 409 as const,
        message: "Job is not open for acceptance",
      };
    }

    try {
      const engagement = await tx.engagement.create({
        data: { workerId, jobId },
        include: {
          job: {
            include: {
              hirer: { select: { id: true, name: true } },
            },
          },
        },
      });

      return {
        success: true,
        statusCode: 201 as const,
        engagement,
      };
    } catch (error: any) {
      if (error.code === "P2002" || error.code === "23505") {
        throw error;
      }
      throw error;
    }
  });
}
