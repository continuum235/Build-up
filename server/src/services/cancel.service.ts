import { prisma } from "../lib/prisma";

export async function updateEngagementWithCancelOrComplete(
  engagementId: string,
  userId: string,
  status: "COMPLETED" | "CANCELLED",
  cancellationReason?: string,
) {
  return await prisma.$transaction(async (tx) => {
    const engagement = await tx.engagement.findUnique({
      where: { id: engagementId },
      include: { job: { select: { hirerId: true, id: true, status: true } } },
    });

    if (!engagement) {
      return {
        success: false,
        statusCode: 404 as const,
        message: "Engagement not found",
      };
    }

    if (engagement.status !== "ACTIVE") {
      return {
        success: false,
        statusCode: 409 as const,
        message: "Engagement is not active",
      };
    }

    const isWorker = engagement.workerId === userId;
    const isHirer = engagement.job.hirerId === userId;

    if (!isWorker && !isHirer) {
      return {
        success: false,
        statusCode: 403 as const,
        message: "Forbidden",
      };
    }

    // Update engagement
    const count = await tx.engagement.updateMany({
      where: { id: engagementId, status: "ACTIVE" },
      data: {
        status,
        ...(status === "CANCELLED" && cancellationReason
          ? { cancellationReason }
          : status === "CANCELLED"
            ? {}
            : {}),
      },
    });

    if (count.count === 0) {
      return {
        success: false,
        statusCode: 409 as const,
        message: "Engagement is not active",
      };
    }

    if (status === "CANCELLED") {
      // Decrement filledCount (never below 0), set job back to OPEN only if currently FILLED
      await tx.$executeRaw`UPDATE "Job" 
         SET "filledCount" = GREATEST("filledCount" - 1, 0),
             "status" = CASE WHEN "status" = 'FILLED' THEN 'OPEN' ELSE "status" END
         WHERE "id" = ${engagement.jobId}`;
    }

    const updated = await tx.engagement.findUnique({
      where: { id: engagementId },
      include: {
        job: { select: { id: true, title: true, status: true } },
        worker: { select: { id: true, name: true } },
      },
    });

    return {
      success: true,
      statusCode: 200 as const,
      engagement: updated,
    };
  });
}
