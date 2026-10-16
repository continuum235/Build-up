import "dotenv/config";
import { clerkMiddleware, getAuth } from "@clerk/express";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import rateLimit, { ipKeyGenerator } from "express-rate-limit";
import { authRouter } from "./routes/auth.routes";
import { engagementRouter } from "./routes/engagement.routes";
import { hirerRouter } from "./routes/hirer.routes";
import { jobRouter } from "./routes/job.routes";
import { userRouter } from "./routes/user.routes";
import { workerRouter } from "./routes/worker.routes";
import { conversationRouter } from "./routes/conversation.routes";
import { attachWebSocketServer } from "./realtime/ws";
import { Prisma } from "@prisma/client";

const app = express();
const port = process.env.PORT ?? 3000;

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  // Higher budget for signed-in users (keyed per user below); anonymous
  // traffic stays keyed by IP.
  max: (req) => (getAuth(req).userId ? 600 : 300),
  standardHeaders: true,
  legacyHeaders: false,
  // JSON body so the app can show a real message instead of a generic error
  handler: (_req, res) => {
    res.status(429).json({
      message: "Too many requests. Please wait a minute and try again.",
    });
  },
  // Key by Clerk user when authenticated: many mobile users share one public
  // IP (carrier-grade NAT), so an IP-only bucket starves unrelated users.
  keyGenerator: (req) => {
    const userId = getAuth(req).userId;
    return userId ? `user:${userId}` : ipKeyGenerator(req.ip ?? "");
  },
});

const _strictLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
});

if (process.env.TRUST_PROXY === "1") {
  app.set("trust proxy", 1);
}

app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(",").map((s: string) => s.trim())
    : undefined,
}));
app.use(express.json({ limit: "100kb" }));
app.use(clerkMiddleware());
app.use(globalLimiter);

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

app.get("/health/db", async (_req, res) => {
  try {
    const { prisma } = await import("./lib/prisma");
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({ status: "ok" });
  } catch {
    res.status(500).json({ status: "error" });
  }
});

app.use("/auth", authRouter);
app.use("/engagements", engagementRouter);
app.use("/jobs", jobRouter);
app.use("/users", userRouter);
app.use("/workers", workerRouter);
app.use("/hirers", hirerRouter);
app.use("/conversations", conversationRouter);

app.use((err: unknown, req: express.Request, res: express.Response, _next: express.NextFunction) => {
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      return res.status(409).json({ message: "Unique constraint violation" });
    }
    if (err.code === "P2025") {
      return res.status(404).json({ message: "Record not found" });
    }
  }
  console.error({ err, route: req.path, method: req.method });
  res.status(500).json({ message: "Internal server error" });
});

const server = app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

attachWebSocketServer(server);

process.on("SIGTERM", () => {
  server.close(() => process.exit(0));
});
process.on("SIGINT", () => {
  server.close(() => process.exit(0));
});
