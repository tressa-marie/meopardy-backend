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
export function overrideAnswerCorrectness(answerId, isCorrect) {
    const row = db.prepare(`
    SELECT
      pa.id,
      pa.clueId,
      pa.playerId,
      pa.responseTimeMs,
      pa.isCorrect,
      pa.pointsAwarded,
      c.basePoints,
      c.timeLimitSeconds,
      r.gameId
    FROM PlayerAnswer pa
    JOIN Clue c ON pa.clueId = c.id
    JOIN Category cat ON c.categoryId = cat.id
    JOIN Round r ON cat.roundId = r.id
    WHERE pa.id = ?
  `).get(answerId);
    if (!row) {
        throw new Error("Answer not found");
    }
    const alreadyCorrect = row.isCorrect === 1;
    if (alreadyCorrect === isCorrect) {
        const player = db.prepare(`
      SELECT score
      FROM Player
      WHERE id = ?
    `).get(row.playerId);
        return {
            answerId: row.id,
            gameId: row.gameId,
            playerId: row.playerId,
            isCorrect,
            pointsAwarded: row.pointsAwarded,
            pointsDelta: 0,
            newScore: player?.score ?? 0,
            changed: false
        };
    }
    const effectiveResponseTimeMs = row.responseTimeMs ?? row.timeLimitSeconds * 1000;
    const pointsAwarded = isCorrect
        ? calculatePoints(row.basePoints, true, effectiveResponseTimeMs, row.timeLimitSeconds)
        : 0;
    const pointsDelta = pointsAwarded - row.pointsAwarded;
    const transaction = db.transaction(() => {
        db.prepare(`
      UPDATE PlayerAnswer
      SET isCorrect = ?,
          pointsAwarded = ?
      WHERE id = ?
    `).run(isCorrect ? 1 : 0, pointsAwarded, row.id);
        if (pointsDelta !== 0) {
            db.prepare(`
        UPDATE Player
        SET score = score + ?
        WHERE id = ?
      `).run(pointsDelta, row.playerId);
            db.prepare(`
        INSERT INTO ScoreEvent (
          playerId,
          clueId,
          pointsChanged,
          reason
        )
        VALUES (?, ?, ?, ?)
      `).run(row.playerId, row.clueId, pointsDelta, "Admin override");
        }
        const player = db.prepare(`
      SELECT score
      FROM Player
      WHERE id = ?
    `).get(row.playerId);
        return {
            answerId: row.id,
            gameId: row.gameId,
            playerId: row.playerId,
            isCorrect,
            pointsAwarded,
            pointsDelta,
            newScore: player?.score ?? 0,
            changed: true
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
