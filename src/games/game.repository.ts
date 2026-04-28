import { db } from "../db/database.js";

export function getGameById(gameId: number) {
  return db.prepare(`
    SELECT *
    FROM Game
    WHERE id = ?
  `).get(gameId);
}

export function getGameByJoinCode(joinCode: string) {
  return db.prepare(`
    SELECT *
    FROM Game
    WHERE joinCode = ?
  `).get(joinCode.toUpperCase());
}

export function getGameBoard(gameId: number) {
  const game = db.prepare(`
    SELECT *
    FROM Game
    WHERE id = ?
  `).get(gameId);

  const rounds = db.prepare(`
    SELECT *
    FROM Round
    WHERE gameId = ?
    ORDER BY roundOrder
  `).all(gameId);

  const categories = db.prepare(`
    SELECT c.*
    FROM Category c
    JOIN Round r ON c.roundId = r.id
    WHERE r.gameId = ?
    ORDER BY c.categoryOrder
  `).all(gameId);

  const clues = db.prepare(`
    SELECT clue.*
    FROM Clue clue
    JOIN Category c ON clue.categoryId = c.id
    JOIN Round r ON c.roundId = r.id
    WHERE r.gameId = ?
    ORDER BY clue.clueOrder
  `).all(gameId);

  return {
    game,
    rounds,
    categories,
    clues
  };
}