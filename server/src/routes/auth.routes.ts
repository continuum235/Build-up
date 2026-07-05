import { Router } from "express";
import { getMe, syncUser } from "../controllers/auth.controller";
import { requireAuth } from "../middleware/auth";

export const authRouter = Router();

authRouter.post("/sync", requireAuth, syncUser);
authRouter.get("/me", requireAuth, getMe);
