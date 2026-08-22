import { Router } from "express";
import type { Server } from "socket.io";
import { createPlayer, getPlayersForGame } from "./player.repository.js";
import { getGameByJoinCode } from "../games/game.repository.js";
import { adminRoom } from "../sockets/rooms.js";

export function createPlayerRouter(io: Server) {
  const playerRouter = Router();

  playerRouter.post("/join", (req, res) => {
    const { joinCode, playerName } = req.body;

    if (!joinCode || !playerName) {
      return res.status(400).json({
        message: "joinCode and playerName are requiredddd"
      });
    }

    const game = getGameByJoinCode(joinCode) as { id: number } | undefined;

    if (!game) {
      return res.status(404).json({
        message: "Game not found"
      });
    }

    const player = createPlayer(game.id, playerName);
    const players = getPlayersForGame(game.id);

    io.to(adminRoom(game.id)).emit("players:updated", players);

    return res.status(201).json(player);
  });

  playerRouter.get("/game/:gameId", (req, res) => {
    const gameId = Number(req.params.gameId);

    return res.json(getPlayersForGame(gameId));
  });

  return playerRouter;
}
