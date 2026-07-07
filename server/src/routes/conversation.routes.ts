import { Router } from "express";
import {
  createOrFindConversation,
  listConversations,
  getConversationMessages,
  sendMessage,
} from "../controllers/conversation.controller";
import { requireAuth } from "../middleware/auth";

export const conversationRouter = Router();

conversationRouter.get("/", requireAuth, listConversations);
conversationRouter.post("/", requireAuth, createOrFindConversation);
conversationRouter.get("/:id/messages", requireAuth, getConversationMessages);
conversationRouter.post("/:id/messages", requireAuth, sendMessage);
