import { Router, type IRouter } from "express";
import { eq, sql, count, gt } from "drizzle-orm";
import { db, songsTable, mixtapesTable, playsTable, commentsTable } from "@workspace/db";
import { requireAdmin } from "../middlewares/auth";

const router: IRouter = Router();

router.get("/analytics/trending", async (_req, res): Promise<void> => {
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const trending = await db
    .select({
      id: songsTable.id,
      title: songsTable.title,
      artist: songsTable.artist,
      genre: songsTable.genre,
      audioUrl: songsTable.audioUrl,
      duration: songsTable.duration,
      mixtapeId: songsTable.mixtapeId,
      mixtapeTitle: mixtapesTable.title,
      mixtapeCoverUrl: mixtapesTable.coverUrl,
      trackNumber: songsTable.trackNumber,
      totalPlays: songsTable.totalPlays,
      createdAt: songsTable.createdAt,
      weekPlays: sql<number>`cast(count(${playsTable.id}) as int)`,
    })
    .from(songsTable)
    .leftJoin(mixtapesTable, eq(songsTable.mixtapeId, mixtapesTable.id))
    .leftJoin(
      playsTable,
      sql`${playsTable.songId} = ${songsTable.id} AND ${playsTable.playedAt} > ${weekAgo.toISOString()}`
    )
    .groupBy(songsTable.id, mixtapesTable.title, mixtapesTable.coverUrl)
    .orderBy(sql`count(${playsTable.id}) desc`)
    .limit(10);

  res.json(trending);
});

router.get("/analytics/top-songs", async (_req, res): Promise<void> => {
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const topSongs = await db
    .select({
      id: songsTable.id,
      title: songsTable.title,
      artist: songsTable.artist,
      genre: songsTable.genre,
      audioUrl: songsTable.audioUrl,
      duration: songsTable.duration,
      mixtapeId: songsTable.mixtapeId,
      mixtapeTitle: mixtapesTable.title,
      mixtapeCoverUrl: mixtapesTable.coverUrl,
      trackNumber: songsTable.trackNumber,
      totalPlays: songsTable.totalPlays,
      createdAt: songsTable.createdAt,
      weekPlays: sql<number>`cast(count(${playsTable.id}) as int)`,
    })
    .from(songsTable)
    .leftJoin(mixtapesTable, eq(songsTable.mixtapeId, mixtapesTable.id))
    .leftJoin(
      playsTable,
      sql`${playsTable.songId} = ${songsTable.id} AND ${playsTable.playedAt} > ${weekAgo.toISOString()}`
    )
    .groupBy(songsTable.id, mixtapesTable.title, mixtapesTable.coverUrl)
    .orderBy(sql`${songsTable.totalPlays} desc`)
    .limit(20);

  res.json(topSongs);
});

router.get("/analytics/overview", requireAdmin, async (_req, res): Promise<void> => {
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [[totalSongsResult], [totalMixtapesResult], [totalCommentsResult], [weekPlaysResult]] =
    await Promise.all([
      db.select({ count: count() }).from(songsTable),
      db.select({ count: count() }).from(mixtapesTable),
      db.select({ count: count() }).from(commentsTable),
      db.select({ count: count() }).from(playsTable).where(gt(playsTable.playedAt, weekAgo)),
    ]);

  const allTimePlays = await db
    .select({ total: sql<number>`cast(sum(${songsTable.totalPlays}) as int)` })
    .from(songsTable);

  const totalPlaysAllTime = allTimePlays[0]?.total ?? 0;

  const topSongs = await db
    .select({
      id: songsTable.id,
      title: songsTable.title,
      artist: songsTable.artist,
      genre: songsTable.genre,
      audioUrl: songsTable.audioUrl,
      duration: songsTable.duration,
      mixtapeId: songsTable.mixtapeId,
      mixtapeTitle: mixtapesTable.title,
      mixtapeCoverUrl: mixtapesTable.coverUrl,
      trackNumber: songsTable.trackNumber,
      totalPlays: songsTable.totalPlays,
      createdAt: songsTable.createdAt,
      weekPlays: sql<number>`cast(count(${playsTable.id}) as int)`,
    })
    .from(songsTable)
    .leftJoin(mixtapesTable, eq(songsTable.mixtapeId, mixtapesTable.id))
    .leftJoin(
      playsTable,
      sql`${playsTable.songId} = ${songsTable.id} AND ${playsTable.playedAt} > ${weekAgo.toISOString()}`
    )
    .groupBy(songsTable.id, mixtapesTable.title, mixtapesTable.coverUrl)
    .orderBy(sql`${songsTable.totalPlays} desc`)
    .limit(5);

  const trendingThisWeek = await db
    .select({
      id: songsTable.id,
      title: songsTable.title,
      artist: songsTable.artist,
      genre: songsTable.genre,
      audioUrl: songsTable.audioUrl,
      duration: songsTable.duration,
      mixtapeId: songsTable.mixtapeId,
      mixtapeTitle: mixtapesTable.title,
      mixtapeCoverUrl: mixtapesTable.coverUrl,
      trackNumber: songsTable.trackNumber,
      totalPlays: songsTable.totalPlays,
      createdAt: songsTable.createdAt,
      weekPlays: sql<number>`cast(count(${playsTable.id}) as int)`,
    })
    .from(songsTable)
    .leftJoin(mixtapesTable, eq(songsTable.mixtapeId, mixtapesTable.id))
    .leftJoin(
      playsTable,
      sql`${playsTable.songId} = ${songsTable.id} AND ${playsTable.playedAt} > ${weekAgo.toISOString()}`
    )
    .groupBy(songsTable.id, mixtapesTable.title, mixtapesTable.coverUrl)
    .orderBy(sql`count(${playsTable.id}) desc`)
    .limit(5);

  res.json({
    totalPlaysAllTime,
    totalPlaysThisWeek: totalCommentsResult ? weekPlaysResult.count : 0,
    totalSongs: totalSongsResult.count,
    totalMixtapes: totalMixtapesResult.count,
    totalComments: totalCommentsResult.count,
    topSongs,
    trendingThisWeek,
  });
});

export default router;
