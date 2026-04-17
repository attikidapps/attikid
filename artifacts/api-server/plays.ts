import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, adminTable, commentsTable, songsTable } from "@workspace/db";
import { AdminLoginBody } from "@workspace/api-zod";
import bcrypt from "bcryptjs";
import { requireAdmin } from "../middlewares/auth";

const router: IRouter = Router();

router.post("/admin/login", async (req, res): Promise<void> => {
  const parsed = AdminLoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request" });
    return;
  }

  const { username, password } = parsed.data;
  const [admin] = await db
    .select()
    .from(adminTable)
    .where(eq(adminTable.username, username));

  if (!admin) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  const valid = await bcrypt.compare(password, admin.passwordHash);
  if (!valid) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  (req.session as Record<string, unknown>).adminId = admin.id;
  (req.session as Record<string, unknown>).username = admin.username;

  res.json({ success: true, username: admin.username });
});

router.post("/admin/logout", async (req, res): Promise<void> => {
  req.session.destroy(() => {
    res.json({ success: true });
  });
});

router.get("/admin/me", async (req, res): Promise<void> => {
  const session = req.session as Record<string, unknown>;
  if (!session.adminId) {
    res.json({ authenticated: false, username: null });
    return;
  }
  res.json({ authenticated: true, username: session.username ?? null });
});

router.get("/admin/comments", requireAdmin, async (_req, res): Promise<void> => {
  const comments = await db
    .select({
      id: commentsTable.id,
      songId: commentsTable.songId,
      songTitle: songsTable.title,
      name: commentsTable.name,
      text: commentsTable.text,
      createdAt: commentsTable.createdAt,
    })
    .from(commentsTable)
    .leftJoin(songsTable, eq(commentsTable.songId, songsTable.id))
    .orderBy(commentsTable.createdAt);

  const result = comments.map((c) => ({
    ...c,
    songTitle: c.songTitle ?? "Unknown Song",
  }));

  res.json(result);
});

export default router;
