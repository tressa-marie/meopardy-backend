import { Router } from "express";
import { importGameSchema } from "./game.schema.js";
import { importGame } from "./importGame.js";
import { getGameBoard } from "./game.repository.js";

export const gameRouter = Router();

gameRouter.post("/import", (req, res) => {
  const parsed = importGameSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      message: "Invalid game JSON",
      errors: parsed.error.flatten()
    });
  }

  const result = importGame(parsed.data);

  return res.status(201).json({
    message: "Game imported successfully",
    ...result
  });
});

gameRouter.get("/:gameId/board", (req, res) => {
  const gameId = Number(req.params.gameId);

  if (Number.isNaN(gameId)) {
    return res.status(400).json({ message: "Invalid game ID" });
  }

  return res.json(getGameBoard(gameId));
});