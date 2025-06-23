import cors from "cors";
import "dotenv/config";
import express from "express";
import http from "http";
import { Server } from "socket.io";
import { errorHandler } from "./middleware/errorHandler";
import { requestLogger } from "./middleware/requestLogger";
import gameModesRouter from "./routes/gameModes";
import gamesRouter from "./routes/games";
import lobbiesRouter from "./routes/lobbies";
import playersRouter from "./routes/players";
import questionsRouter from "./routes/questions";
import { initializeSocketHandlers } from "./socket/socketHandlers";

const app = express();

app.use(cors());
app.use(express.json());
app.use(requestLogger);

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/game-modes", gameModesRouter);
app.use("/api/games", gamesRouter);
app.use("/api/lobbies", lobbiesRouter);
app.use("/api/players", playersRouter);
app.use("/api/questions", questionsRouter);

app.use(errorHandler);

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});
initializeSocketHandlers(io);

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3001;
server.listen(PORT, () => {
  console.log(`Backend listening on port ${PORT}`);
});
