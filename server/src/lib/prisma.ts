import { neonConfig } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "@prisma/client";
import ws from "ws";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is required");
}

neonConfig.webSocketConstructor = ws;

const adapter = new PrismaNeon({ connectionString });

export const prisma = new PrismaClient({ adapter });
