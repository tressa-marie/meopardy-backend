import express from "express";
import cors from "cors";
import http from "node:http";
import { Server } from "socket.io";

import { createSchema } from "./db/schema.js";
import { gameRouter } from "./games/game.routes.js";
import { createAnswerRouter } from "./answers/answer.routes.js";
import { clueRouter } from "./clues/clue.routes.js";
import { configureSockets } from "./sockets/socket.js";
import { createPlayerRouter } from "./players/player.routes.js";

createSchema();

const app = express();

const allowedOrigins = (process.env.CORS_ORIGIN ?? "http://localhost:4200")
  .split(",")
  .map(origin => origin.trim())
  .filter(Boolean);

app.use(cors({
  origin: allowedOrigins
}));

app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "Jeopardy backend is running"
  });
});

app.get("/api", (req, res) => {
  res.json({
    message: "Jeopardy API is running"
  });
});

app.use("/api/games", gameRouter);
app.use("/api/clues", clueRouter);
app.use("/clues", clueRouter);

const httpServer = http.createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins
  }
});

app.use("/api/players", createPlayerRouter(io));
app.use("/api/answers", createAnswerRouter(io));

configureSockets(io);

const PORT = Number(process.env.PORT) || 3000;

httpServer.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
  console.log(`Allowed origins: ${allowedOrigins.join(", ")}`);
});
