import express from "express";
import cors from "cors";
import http from "node:http";
import { Server } from "socket.io";

import { createSchema } from "./db/schema.js";
import { gameRouter } from "./games/game.routes.js";
import { playerRouter } from "./players/player.routes.js";
import { answerRouter } from "./answers/answer.routes.js";
import { configureSockets } from "./sockets/socket.js";

createSchema();

const app = express();

app.use(cors({
  origin: "http://localhost:4200"
}));

app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "Jeopardy backend is running"
  });
});

app.use("/games", gameRouter);
app.use("/players", playerRouter);
app.use("/answers", answerRouter);

const httpServer = http.createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:4200"
  }
});

configureSockets(io);

const PORT = 3000;

httpServer.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});