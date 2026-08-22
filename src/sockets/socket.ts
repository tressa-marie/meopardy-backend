import type { Server } from "socket.io";
import { adminRoom, gameRoom, playerRoom } from "./rooms.js";

type GameIdPayload = {
  gameId: number;
};

export function configureSockets(io: Server) {
  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);

    socket.on("admin:joinGame", ({ gameId }: GameIdPayload) => {
      socket.join(gameRoom(gameId));
      socket.join(adminRoom(gameId));
      console.log(`Socket ${socket.id} joined ${adminRoom(gameId)} via admin:joinGame`);
    });

    socket.on("player:joinGame", ({ gameId }: GameIdPayload) => {
      socket.join(gameRoom(gameId));
      socket.join(playerRoom(gameId));
      console.log(`Socket ${socket.id} joined ${playerRoom(gameId)} via player:joinGame`);
    });

    socket.on("game:start", ({ gameId }: GameIdPayload) => {
      io.to(playerRoom(gameId)).emit("game:started");
      console.log(`Socket ${socket.id} started game ${gameId}`);
    });

    socket.on("join-game-room", ({ gameId }) => {
      socket.join(`game:${gameId}`);
      console.log(`Socket ${socket.id} joined game:${gameId}`);
    });

    socket.on("host-selected-clue", ({ gameId, clueId }) => {
      io.to(`game:${gameId}`).emit("clue-selected", {
        clueId
      });
    });

    socket.on("host-started-timer", ({ gameId, clueId, startedAt }) => {
      io.to(`game:${gameId}`).emit("timer-started", {
        clueId,
        startedAt
      });
    });

    socket.on("host-revealed-answer", ({ gameId, clueId }) => {
      io.to(`game:${gameId}`).emit("answer-revealed", {
        clueId
      });
    });

    socket.on("player-submitted-answer", ({ gameId, clueId, playerId }) => {
      io.to(`game:${gameId}`).emit("answer-submitted", {
        clueId,
        playerId
      });
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected:", socket.id);
    });
  });
}
