import { Router } from "express";
import { getUserReviews } from "../controllers/user.controller";

export const userRouter = Router();

userRouter.get("/:id/reviews", getUserReviews);
