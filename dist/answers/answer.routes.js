import { Router } from "express";
import { getAnswersForClue, overrideAnswerCorrectness, submitAnswer } from "./answer.repository.js";
import { getPlayersForGame } from "../players/player.repository.js";
import { adminRoom } from "../sockets/rooms.js";
export function createAnswerRouter(io) {
    const answerRouter = Router();
    answerRouter.post("/submit", (req, res) => {
        const { clueId, playerId, submittedAnswer, responseTimeMs } = req.body;
        if (!clueId || !playerId || !submittedAnswer || responseTimeMs == null) {
            return res.status(400).json({
                message: "clueId, playerId, submittedAnswer, and responseTimeMs are required"
            });
        }
        try {
            const result = submitAnswer(Number(clueId), Number(playerId), submittedAnswer, Number(responseTimeMs));
            return res.status(201).json(result);
        }
        catch (error) {
            return res.status(404).json({
                message: error instanceof Error ? error.message : "Failed to submit answer"
            });
        }
    });
    answerRouter.patch("/:answerId/override", (req, res) => {
        const answerId = Number(req.params.answerId);
        const { isCorrect } = req.body;
        if (!Number.isInteger(answerId)) {
            return res.status(400).json({
                message: "Invalid answer ID"
            });
        }
        if (typeof isCorrect !== "boolean") {
            return res.status(400).json({
                message: "isCorrect must be a boolean"
            });
        }
        try {
            const result = overrideAnswerCorrectness(answerId, isCorrect);
            if (result.changed) {
                io.to(adminRoom(result.gameId)).emit("players:updated", getPlayersForGame(result.gameId));
            }
            return res.json(result);
        }
        catch (error) {
            return res.status(404).json({
                message: error instanceof Error ? error.message : "Failed to override answer"
            });
        }
    });
    answerRouter.get("/clue/:clueId", (req, res) => {
        const clueId = Number(req.params.clueId);
        return res.json(getAnswersForClue(clueId));
    });
    return answerRouter;
}
