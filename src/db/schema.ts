import { db } from "./database.js";

export function createSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS Game (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      joinCode TEXT NOT NULL UNIQUE,
      status TEXT NOT NULL DEFAULT 'setup',
      createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS Round (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      gameId INTEGER NOT NULL,
      name TEXT NOT NULL,
      roundOrder INTEGER NOT NULL,
      FOREIGN KEY (gameId) REFERENCES Game(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS Category (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      roundId INTEGER NOT NULL,
      name TEXT NOT NULL,
      categoryOrder INTEGER NOT NULL,
      FOREIGN KEY (roundId) REFERENCES Round(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS Clue (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      categoryId INTEGER NOT NULL,
      question TEXT NOT NULL,
      correctAnswer TEXT NOT NULL,
      acceptableAnswersJson TEXT NOT NULL,
      basePoints INTEGER NOT NULL,
      timeLimitSeconds INTEGER NOT NULL DEFAULT 20,
      clueOrder INTEGER NOT NULL,
      isPlayed INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY (categoryId) REFERENCES Category(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS Player (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      gameId INTEGER NOT NULL,
      name TEXT NOT NULL,
      score INTEGER NOT NULL DEFAULT 0,
      joinedAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (gameId) REFERENCES Game(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS PlayerAnswer (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      clueId INTEGER NOT NULL,
      playerId INTEGER NOT NULL,
      submittedAnswer TEXT NOT NULL,
      submittedAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      responseTimeMs INTEGER,
      isCorrect INTEGER,
      pointsAwarded INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY (clueId) REFERENCES Clue(id) ON DELETE CASCADE,
      FOREIGN KEY (playerId) REFERENCES Player(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS ScoreEvent (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      playerId INTEGER NOT NULL,
      clueId INTEGER,
      pointsChanged INTEGER NOT NULL,
      reason TEXT NOT NULL,
      createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (playerId) REFERENCES Player(id) ON DELETE CASCADE,
      FOREIGN KEY (clueId) REFERENCES Clue(id) ON DELETE SET NULL
    );
  `);
}