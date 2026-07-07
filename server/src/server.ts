import "dotenv/config";
import { clerkMiddleware } from "@clerk/express";
import cors from "cors";
import express from "express";
import { authRouter } from "./routes/auth.routes";
import { engagementRouter } from "./routes/engagement.routes";
import { hirerRouter } from "./routes/hirer.routes";
import { jobRouter } from "./routes/job.routes";
import { userRouter } from "./routes/user.routes";
import { workerRouter } from "./routes/worker.routes";
import { conversationRouter } from "./routes/conversation.routes";

const app = express();
const port = process.env.PORT ?? 3000;

app.use(cors());
app.use(express.json());
app.use(clerkMiddleware());

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use("/auth", authRouter);
app.use("/engagements", engagementRouter);
app.use("/jobs", jobRouter);
app.use("/users", userRouter);
app.use("/workers", workerRouter);
app.use("/hirers", hirerRouter);
app.use("/conversations", conversationRouter);

app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ message: "Internal server error" });
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
