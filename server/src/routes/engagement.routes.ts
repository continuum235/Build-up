import { Router } from "express";
import {
  createReview,
  updateEngagement,
} from "../controllers/engagement.controller";
import { requireAuth } from "../middleware/auth";

export const engagementRouter = Router();

engagementRouter.patch("/:id", requireAuth, updateEngagement);
engagementRouter.post("/:id/review", requireAuth, createReview);
