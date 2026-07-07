import { Router } from "express";
import { getUserReviews, patchUser } from "../controllers/user.controller";
import { requireAuth } from "../middleware/auth";

export const userRouter = Router();

userRouter.get("/:id/reviews", getUserReviews);
userRouter.patch("/me", requireAuth, patchUser);
