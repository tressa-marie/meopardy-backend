import { db } from "../db/database.js";

type GameRow = {
  id: number;
  title: string;
  joinCode: string;
  status: string;
  createdAt: string;
};

type RoundRow = {
  id: number;
  gameId: number;
  name: string;
  roundOrder: number;
};

type CategoryRow = {
  id: number;
  roundId: number;
  name: string;
  categoryOrder: number;
};

type ClueRow = {
  id: number;
  categoryId: number;
  question: string;
  correctAnswer: string;
  acceptableAnswersJson: string;
  basePoints: number;
  timeLimitSeconds: number;
  clueOrder: number;
  isAnswered: number;
  isPlayed: number;
};

export function getGameById(gameId: number) {
  return db.prepare<[number], GameRow>(`
    SELECT *
    FROM Game
    WHERE id = ?
  `).get(gameId);
}

export function getGameByJoinCode(joinCode: string) {
  return db.prepare<[string], GameRow>(`
    SELECT *
    FROM Game
    WHERE joinCode = ?
  `).get(joinCode.toUpperCase());
}

export function getGameJoinCode(gameId: number) {
  const game = getGameById(gameId);

  if (!game) {
    return null;
  }

  return game.joinCode;
}

export function getGameBoard(gameId: number) {
  const game = db.prepare<[number], GameRow>(`
    SELECT *
    FROM Game
    WHERE id = ?
  `).get(gameId);

  const categories = db.prepare<[number], CategoryRow>(`
    SELECT c.*
    FROM Category c
    JOIN Round r ON c.roundId = r.id
    WHERE r.gameId = ?
    ORDER BY c.categoryOrder
  `).all(gameId);

  const clues = db.prepare<[number], ClueRow>(`
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
