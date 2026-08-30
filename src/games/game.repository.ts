import { db } from "../db/database.js";

export const GAME_THEMES = ["classic", "pastel-holiday"] as const;

export const DEFAULT_GAME_THEME = "classic";

export type GameTheme = typeof GAME_THEMES[number];

export function isGameTheme(value: unknown): value is GameTheme {
  return GAME_THEMES.includes(value as GameTheme);
}

type GameRow = {
  id: number;
  title: string;
  joinCode: string;
  status: string;
  theme: string;
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

export function getGameTheme(gameId: number): GameTheme {
  const row = db.prepare<[number], { theme: string }>(`
    SELECT theme
    FROM Game
    WHERE id = ?
  `).get(gameId);

  return isGameTheme(row?.theme) ? row.theme : DEFAULT_GAME_THEME;
}

export function setGameTheme(gameId: number, theme: GameTheme) {
  const result = db.prepare(`
    UPDATE Game
    SET theme = ?
    WHERE id = ?
  `).run(theme, gameId);

  return result.changes > 0;
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
