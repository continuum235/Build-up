import type { Role } from "@prisma/client";

declare global {
  namespace Express {
    interface Request {
      auth?: {
        userId: string;
        sessionId?: string | null;
      };
      currentUser?: {
        id: string;
        clerkId: string;
        email: string;
        name: string;
        role: Role;
      };
    }
  }
}

export {};
