import { randomInt } from "node:crypto";

import { db } from "../db/database.js";
import type { ImportGameInput } from "./game.schema.js";

const JOIN_CODE_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
const JOIN_CODE_LENGTH = 6;
const JOIN_CODE_ATTEMPTS = 20;

function createJoinCode() {
  let code = "";

  for (let i = 0; i < JOIN_CODE_LENGTH; i++) {
    code += JOIN_CODE_ALPHABET[randomInt(JOIN_CODE_ALPHABET.length)];
  }

  return code;
}

function createUniqueJoinCode() {
  const findByJoinCode = db.prepare<[string], { id: number }>(`
    SELECT id
    FROM Game
    WHERE joinCode = ?
  `);

  for (let attempt = 0; attempt < JOIN_CODE_ATTEMPTS; attempt++) {
    const joinCode = createJoinCode();

    if (!findByJoinCode.get(joinCode)) {
      return joinCode;
    }
  }

  throw new Error(
    `Could not generate a unique join code after ${JOIN_CODE_ATTEMPTS} attempts`
  );
}

export function importGame(game: ImportGameInput) {
  const insertGame = db.prepare(`
    INSERT INTO Game (title, joinCode)
    VALUES (?, ?)
  `);

  const insertRound = db.prepare(`
    INSERT INTO Round (gameId, name, roundOrder)
    VALUES (?, ?, ?)
  `);

  const insertCategory = db.prepare(`
    INSERT INTO Category (roundId, name, categoryOrder)
    VALUES (?, ?, ?)
  `);

  const insertClue = db.prepare(`
    INSERT INTO Clue (
      categoryId,
      question,
      correctAnswer,
      acceptableAnswersJson,
      basePoints,
      timeLimitSeconds,
      clueOrder
    )
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const transaction = db.transaction(() => {
    const joinCode = createUniqueJoinCode();

    const gameResult = insertGame.run(game.title, joinCode);
    const gameId = Number(gameResult.lastInsertRowid);

    game.rounds.forEach((round, roundIndex) => {
      const roundResult = insertRound.run(gameId, round.name, roundIndex + 1);
      const roundId = Number(roundResult.lastInsertRowid);

      round.categories.forEach((category, categoryIndex) => {
        const categoryResult = insertCategory.run(
          roundId,
          category.name,
          categoryIndex + 1
        );

        const categoryId = Number(categoryResult.lastInsertRowid);

        category.clues.forEach((clue, clueIndex) => {
          insertClue.run(
            categoryId,
            clue.question,
            clue.correctAnswer,
            JSON.stringify(clue.acceptableAnswers),
            clue.basePoints,
            clue.timeLimitSeconds,
            clueIndex + 1
          );
        });
      });
    });

    return {
      gameId,
      joinCode
    };
  });

  return transaction();
}