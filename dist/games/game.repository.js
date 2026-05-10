import { db } from "../db/database.js";
export function getGameById(gameId) {
    return db.prepare(`
    SELECT *
    FROM Game
    WHERE id = ?
  `).get(gameId);
}
export function getGameByJoinCode(joinCode) {
    return db.prepare(`
    SELECT *
    FROM Game
    WHERE joinCode = ?
  `).get(joinCode.toUpperCase());
}
export function getGameJoinCode(gameId) {
    const game = getGameById(gameId);
    if (!game) {
        return null;
    }
    return game.joinCode;
}
export function getGameBoard(gameId) {
    const game = db.prepare(`
    SELECT *
    FROM Game
    WHERE id = ?
  `).get(gameId);
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
    const categoriesWithClues = categories.map(category => ({
        ...category,
        clues: clues.filter(clue => clue.categoryId === category.id)
    }));
    return {
        ...game,
        categories: categoriesWithClues
    };
}
