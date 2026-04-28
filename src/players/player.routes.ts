import { Router } from "express";
import { createPlayer, getPlayersForGame } from "./player.repository.js";
import { getGameByJoinCode } from "../games/game.repository.js";

export const playerRouter = Router();

playerRouter.post("/join", (req, res) => {
  const { joinCode, name } = req.body;

  if (!joinCode || !name) {
    return res.status(400).json({
      message: "joinCode and name are required"
    });
  }

  const game = getGameByJoinCode(joinCode) as { id: number } | undefined;

  if (!game) {
    return res.status(404).json({
      message: "Game not found"
    });
  }

  const player = createPlayer(game.id, name);

  return res.status(201).json(player);
});

playerRouter.get("/game/:gameId", (req, res) => {
  const gameId = Number(req.params.gameId);

  return res.json(getPlayersForGame(gameId));
});