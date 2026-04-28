import { db } from "../db/database.js";

export function createPlayer(gameId: number, name: string) {
  const result = db.prepare(`
    INSERT INTO Player (gameId, name)
    VALUES (?, ?)
  `).run(gameId, name);

  return {
    id: Number(result.lastInsertRowid),
    gameId,
    name,
    score: 0
  };
}

export function getPlayersForGame(gameId: number) {
  return db.prepare(`
    SELECT *
    FROM Player
    WHERE gameId = ?
    ORDER BY joinedAt
  `).all(gameId);
}