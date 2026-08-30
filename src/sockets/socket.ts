import type { Server } from "socket.io";
import { adminRoom, gameRoom, playerRoom } from "./rooms.js";
import { getGameTheme, isGameTheme, setGameTheme } from "../games/game.repository.js";

type GameIdPayload = {
  gameId: number;
};

type ClueSelectedPayload = {
  gameId: number;
  clue: unknown;
};

type AnswerSubmittedPayload = {
  gameId: number;
  answer: unknown;
};

type ThemeChangedPayload = {
  gameId: number;
  theme: unknown;
};

export function configureSockets(io: Server) {
  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);

    socket.on("admin:joinGame", ({ gameId }: GameIdPayload) => {
      socket.join(gameRoom(gameId));
      socket.join(adminRoom(gameId));
      socket.emit("game:themeChanged", {
        gameId,
        theme: getGameTheme(gameId)
      });
      console.log(`Socket ${socket.id} joined ${adminRoom(gameId)} via admin:joinGame`);
    });

    socket.on("player:joinGame", ({ gameId }: GameIdPayload) => {
      socket.join(gameRoom(gameId));
      socket.join(playerRoom(gameId));
      socket.emit("game:themeChanged", {
        gameId,
        theme: getGameTheme(gameId)
      });
      console.log(`Socket ${socket.id} joined ${playerRoom(gameId)} via player:joinGame`);
    });

    socket.on("game:start", ({ gameId }: GameIdPayload) => {
      io.to(playerRoom(gameId)).emit("game:started");
      console.log(`Socket ${socket.id} started game ${gameId}`);
    });

    socket.on("game:clueSelected", ({ gameId, clue }: ClueSelectedPayload) => {
      io.to([playerRoom(gameId), adminRoom(gameId)]).emit("game:clueSelected", {
        gameId,
        clue
      });
      console.log(`Socket ${socket.id} selected a clue for game ${gameId}`);
    });

    socket.on("game:themeChanged", ({ gameId, theme }: ThemeChangedPayload) => {
      if (!isGameTheme(theme)) {
        console.log(`Socket ${socket.id} sent an unknown theme: ${String(theme)}`);
        return;
      }

      setGameTheme(gameId, theme);

      io.to([playerRoom(gameId), adminRoom(gameId)]).emit("game:themeChanged", {
        gameId,
        theme
      });
      console.log(`Socket ${socket.id} set game ${gameId} theme to ${theme}`);
    });

    socket.on("game:clueClosed", ({ gameId }: GameIdPayload) => {
      io.to([playerRoom(gameId), adminRoom(gameId)]).emit("game:clueClosed", {
        gameId
      });
      console.log(`Socket ${socket.id} closed the clue for game ${gameId}`);
    });

    socket.on("game:answerSubmitted", ({ gameId, answer }: AnswerSubmittedPayload) => {
      io.to(adminRoom(gameId)).emit("game:answerSubmitted", {
        gameId,
        answer
      });
      console.log(`Socket ${socket.id} submitted an answer for game ${gameId}`);
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
