import "dotenv/config";
import { clerkMiddleware } from "@clerk/express";
import cors from "cors";
import express from "express";
import { authRouter } from "./routes/auth.routes";
import { jobRouter } from "./routes/job.routes";

const app = express();
const port = process.env.PORT ?? 3000;

app.use(cors());
app.use(express.json());
app.use(clerkMiddleware());

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use("/auth", authRouter);
app.use("/jobs", jobRouter);

app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ message: "Internal server error" });
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
