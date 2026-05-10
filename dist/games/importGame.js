import { db } from "../db/database.js";
function createJoinCode() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
}
export function importGame(game) {
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
        const joinCode = createJoinCode();
        const gameResult = insertGame.run(game.title, joinCode);
        const gameId = Number(gameResult.lastInsertRowid);
        game.rounds.forEach((round, roundIndex) => {
            const roundResult = insertRound.run(gameId, round.name, roundIndex + 1);
            const roundId = Number(roundResult.lastInsertRowid);
            round.categories.forEach((category, categoryIndex) => {
                const categoryResult = insertCategory.run(roundId, category.name, categoryIndex + 1);
                const categoryId = Number(categoryResult.lastInsertRowid);
                category.clues.forEach((clue, clueIndex) => {
                    insertClue.run(categoryId, clue.question, clue.correctAnswer, JSON.stringify(clue.acceptableAnswers), clue.basePoints, clue.timeLimitSeconds, clueIndex + 1);
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
