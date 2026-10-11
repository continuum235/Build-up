import { WebSocketServer, WebSocket } from "ws";
import { Server } from "http";
import { verifyToken } from "@clerk/backend";
import { prisma } from "../lib/prisma";

interface AuthMessage {
  type: "auth";
  token: string;
}

interface PingMessage {
  type: "ping";
}

interface GenericMessage {
  type: string;
  [key: string]: any;
}

type IncomingMessage = AuthMessage | PingMessage | GenericMessage;

const userSockets = new Map<string, Set<WebSocket>>();

function addSocket(userId: string, ws: WebSocket) {
  if (!userSockets.has(userId)) {
    userSockets.set(userId, new Set());
  }
  userSockets.get(userId)!.add(ws);
}

function removeSocket(userId: string, ws: WebSocket) {
  const set = userSockets.get(userId);
  if (set) {
    set.delete(ws);
    if (set.size === 0) {
      userSockets.delete(userId);
    }
  }
}

export function broadcastMessage(conversation: any, message: any) {
  const participants = [conversation.hirerId, conversation.workerId];
  for (const p of participants) {
    const set = userSockets.get(p);
    if (set) {
      for (const ws of set) {
        if (ws.readyState === WebSocket.OPEN) {
          try {
            ws.send(
              JSON.stringify({
                type: "message",
                conversationId: conversation.id,
                message,
              })
            );
          } catch (_e) {
            // ignore broadcast failures
          }
        }
      }
    }
  }
}

export function attachWebSocketServer(httpServer: Server) {
  const wss = new WebSocketServer({ server: httpServer, path: "/ws", maxPayload: 16 * 1024 });

  wss.on("connection", (ws) => {
    let authenticated = false;
    let userId: string | null = null;
    let pingTimeout: NodeJS.Timeout | null = null;
    let authTimeout: NodeJS.Timeout | null = null;

    const scheduleAuthTimeout = () => {
      authTimeout = setTimeout(() => {
        if (!authenticated) {
          try {
            ws.send(JSON.stringify({ type: "error", code: "unauthorized" }));
          } catch (_e) {}
          ws.close(4401);
        }
      }, 5000);
    };

    const scheduleHeartbeat = () => {
      pingTimeout = setTimeout(() => {
        ws.terminate();
      }, 30000);
    };

    ws.on("message", async (data) => {
      let msg: IncomingMessage;
      try {
        msg = JSON.parse(data.toString());
      } catch (_e) {
        return;
      }

      if (msg.type === "auth" && !authenticated) {
        const token = (msg as AuthMessage).token;
        try {
          const secretKey = process.env.CLERK_SECRET_KEY;
          if (!secretKey) {
            throw new Error("no key");
          }
          const verified = await verifyToken(token, { secretKey });
          const clerkId = verified.sub;
          const user = await prisma.user.findUnique({
            where: { clerkId },
            select: { id: true },
          });
          if (!user) {
            throw new Error("no user");
          }
          authenticated = true;
          userId = user.id;
          addSocket(user.id, ws);
          if (authTimeout) clearTimeout(authTimeout);
          try {
            ws.send(JSON.stringify({ type: "ready" }));
          } catch (_e) {}
          scheduleHeartbeat();
        } catch (_e) {
          try {
            ws.send(JSON.stringify({ type: "error", code: "unauthorized" }));
          } catch (_err) {}
          ws.close(4401);
        }
        return;
      }

      if (msg.type === "ping" && authenticated) {
        if (pingTimeout) clearTimeout(pingTimeout);
        try {
          ws.send(JSON.stringify({ type: "pong" }));
        } catch (_e) {}
        scheduleHeartbeat();
        return;
      }
    });

    ws.on("close", () => {
      if (pingTimeout) clearTimeout(pingTimeout);
      if (authTimeout) clearTimeout(authTimeout);
      if (authenticated && userId) {
        removeSocket(userId, ws);
      }
    });

    ws.on("error", () => {
      if (pingTimeout) clearTimeout(pingTimeout);
      if (authTimeout) clearTimeout(authTimeout);
      if (authenticated && userId) {
        removeSocket(userId, ws);
      }
    });

    scheduleAuthTimeout();
  });
}
