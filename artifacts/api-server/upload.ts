import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, commentsTable, songsTable } from "@workspace/db";
import {
  CreateCommentBody,
  CreateCommentParams,
  GetCommentsParams,
  DeleteCommentParams,
} from "@workspace/api-zod";
import { requireAdmin } from "../middlewares/auth";
import rateLimit from "express-rate-limit";

const commentLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many comments. Please wait before commenting again." },
});

const PROFANITY_LIST = ["spam", "shit", "fuck", "ass", "bitch", "cunt", "nigger", "faggot"];

function containsProfanity(text: string): boolean {
  const lower = text.toLowerCase();
  return PROFANITY_LIST.some((word) => lower.includes(word));
}

function validateCaptcha(token: string): boolean {
  const answer = parseInt(token, 10);
  return !isNaN(answer) && answer >= 2 && answer <= 18;
}

const router: IRouter = Router();

router.get("/songs/:id/comments", async (req, res): Promise<void> => {
  const params = GetCommentsParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const comments = await db
    .select()
    .from(commentsTable)
    .where(eq(commentsTable.songId, params.data.id))
    .orderBy(commentsTable.createdAt);
  res.json(comments);
});

router.post("/songs/:id/comments", commentLimiter, async (req, res): Promise<void> => {
  const params = CreateCommentParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = CreateCommentBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { name, text, captchaToken } = parsed.data;

  if (!validateCaptcha(captchaToken)) {
    res.status(400).json({ error: "Captcha validation failed. Please answer the math question correctly." });
    return;
  }

  if (containsProfanity(text) || (name && containsProfanity(name))) {
    res.status(400).json({ error: "Your comment contains inappropriate language" });
    return;
  }

  const trimmedText = text.trim();
  if (!trimmedText) {
    res.status(400).json({ error: "Comment cannot be empty" });
    return;
  }
  if (trimmedText.length > 500) {
    res.status(400).json({ error: "Comment too long (max 500 characters)" });
    return;
  }

  const [song] = await db.select().from(songsTable).where(eq(songsTable.id, params.data.id));
  if (!song) {
    res.status(404).json({ error: "Song not found" });
    return;
  }

  const displayName = name && name.trim() ? name.trim().slice(0, 50) : "Anonymous";

  const [comment] = await db
    .insert(commentsTable)
    .values({ songId: params.data.id, name: displayName, text: trimmedText })
    .returning();

  res.status(201).json(comment);
});

router.delete("/comments/:id", requireAdmin, async (req, res): Promise<void> => {
  const params = DeleteCommentParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [deleted] = await db
    .delete(commentsTable)
    .where(eq(commentsTable.id, params.data.id))
    .returning();
  if (!deleted) {
    res.status(404).json({ error: "Comment not found" });
    return;
  }
  res.sendStatus(204);
});

export default router;
