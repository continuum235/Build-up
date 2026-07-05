import { Router } from "express";
import {
  createJob,
  deleteJob,
  getJob,
  listJobs,
  updateJob,
} from "../controllers/job.controller";
import { acceptJob, rejectJob } from "../controllers/worker.controller";
import { requireAuth } from "../middleware/auth";
import { requireRole } from "../middleware/requireRole";

export const jobRouter = Router();

jobRouter.get("/", listJobs);
jobRouter.get("/:id", getJob);
jobRouter.post("/", requireAuth, requireRole("HIRER"), createJob);
jobRouter.patch("/:id", requireAuth, requireRole("HIRER"), updateJob);
jobRouter.delete("/:id", requireAuth, requireRole("HIRER"), deleteJob);

jobRouter.post("/:jobId/accept", requireAuth, requireRole("WORKER"), acceptJob);
jobRouter.post("/:jobId/reject", requireAuth, requireRole("WORKER"), rejectJob);
