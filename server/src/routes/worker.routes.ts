import { Router } from "express";
import { getMyWorkerJobs } from "../controllers/worker.controller";
import { requireAuth } from "../middleware/auth";
import { requireRole } from "../middleware/requireRole";

export const workerRouter = Router();

workerRouter.get("/me/jobs", requireAuth, requireRole("WORKER"), getMyWorkerJobs);
