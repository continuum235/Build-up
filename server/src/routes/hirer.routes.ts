import { Router } from "express";
import { getMyHirerJobs } from "../controllers/hirer.controller";
import { requireAuth } from "../middleware/auth";
import { requireRole } from "../middleware/requireRole";

export const hirerRouter = Router();

hirerRouter.get("/me/jobs", requireAuth, requireRole("HIRER"), getMyHirerJobs);
