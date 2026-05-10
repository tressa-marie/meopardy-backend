import { db } from "../db/database.js";
import { calculatePoints, isAnswerCorrect } from "./answerUtils.js";
export function submitAnswer(clueId, playerId, submittedAnswer, responseTimeMs) {
    const clue = db.prepare(`
    SELECT *
    FROM Clue
    WHERE id = ?
  `).get(clueId);
    if (!clue) {
        throw new Error("Clue not found");
    }
    const acceptableAnswers = JSON.parse(clue.acceptableAnswersJson);
    const correct = isAnswerCorrect(submittedAnswer, clue.correctAnswer, acceptableAnswers);
    const pointsAwarded = calculatePoints(clue.basePoints, correct, responseTimeMs, clue.timeLimitSeconds);
    const transaction = db.transaction(() => {
        const answerResult = db.prepare(`
      INSERT INTO PlayerAnswer (
        clueId,
        playerId,
        submittedAnswer,
        responseTimeMs,
        isCorrect,
        pointsAwarded
      )
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(clueId, playerId, submittedAnswer, responseTimeMs, correct ? 1 : 0, pointsAwarded);
        if (pointsAwarded > 0) {
            db.prepare(`
        UPDATE Player
        SET score = score + ?
        WHERE id = ?
      `).run(pointsAwarded, playerId);
            db.prepare(`
        INSERT INTO ScoreEvent (
          playerId,
          clueId,
          pointsChanged,
          reason
        )
        VALUES (?, ?, ?, ?)
      `).run(playerId, clueId, pointsAwarded, "Correct answer");
        }
        return {
            answerId: Number(answerResult.lastInsertRowid),
            isCorrect: correct,
            pointsAwarded
        };
    });
    return transaction();
}
export function getAnswersForClue(clueId) {
    return db.prepare(`
    SELECT
      pa.*,
      p.name as playerName
    FROM PlayerAnswer pa
    JOIN Player p ON pa.playerId = p.id
    WHERE pa.clueId = ?
    ORDER BY pa.responseTimeMs ASC
  `).all(clueId);
}
