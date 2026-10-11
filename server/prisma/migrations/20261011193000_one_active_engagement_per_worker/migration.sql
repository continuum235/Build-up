-- CreateIndex
CREATE UNIQUE INDEX "Engagement_one_active_per_worker"
ON "Engagement" ("workerId")
WHERE "status" = 'ACTIVE';
