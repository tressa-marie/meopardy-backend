import { Router } from "express";
import { getAnswersForClue, submitAnswer } from "./answer.repository.js";
export const answerRouter = Router();
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
answerRouter.get("/clue/:clueId", (req, res) => {
    const clueId = Number(req.params.clueId);
    return res.json(getAnswersForClue(clueId));
});
