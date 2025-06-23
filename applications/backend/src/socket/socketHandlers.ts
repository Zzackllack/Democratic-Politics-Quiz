import { Server, Socket } from "socket.io";
import { prisma } from "../lib/prisma";

interface SocketData {
  playerId?: string;
  lobbyId?: string;
}

export const initializeSocketHandlers = (io: Server) => {
  io.on("connection", (socket: Socket) => {
    console.log(`Player connected: ${socket.id}`);

    // Join player to their personal room
    socket.on("player:join", async (data: { playerId: string }) => {
      try {
        socket.data.playerId = data.playerId;
        socket.join(`player:${data.playerId}`);

        // Update player online status
        await prisma.player.update({
          where: { id: data.playerId },
          data: { isOnline: true },
        });

        console.log(`Player ${data.playerId} joined personal room`);
      } catch (error) {
        console.error("Error handling player join:", error);
      }
    });

    // Join lobby room
    socket.on("lobby:join", async (data: { lobbyId: string; playerId: string }) => {
      try {
        socket.data.lobbyId = data.lobbyId;
        socket.join(`lobby:${data.lobbyId}`);

        // Broadcast to other players in lobby
        socket.to(`lobby:${data.lobbyId}`).emit("lobby:player-joined", {
          playerId: data.playerId,
          socketId: socket.id,
        });

        console.log(`Player ${data.playerId} joined lobby ${data.lobbyId}`);
      } catch (error) {
        console.error("Error handling lobby join:", error);
      }
    });

    // Leave lobby room
    socket.on("lobby:leave", async (data: { lobbyId: string; playerId: string }) => {
      try {
        socket.leave(`lobby:${data.lobbyId}`);

        // Broadcast to other players in lobby
        socket.to(`lobby:${data.lobbyId}`).emit("lobby:player-left", {
          playerId: data.playerId,
        });

        socket.data.lobbyId = undefined;
        console.log(`Player ${data.playerId} left lobby ${data.lobbyId}`);
      } catch (error) {
        console.error("Error handling lobby leave:", error);
      }
    });

    // Game events
    socket.on(
      "game:answer-submitted",
      async (data: {
        lobbyId: string;
        playerId: string;
        questionId: string;
        isCorrect: boolean;
      }) => {
        try {
          // Broadcast to all players in the lobby that someone submitted an answer
          io.to(`lobby:${data.lobbyId}`).emit("game:player-answered", {
            playerId: data.playerId,
            questionId: data.questionId,
            timestamp: new Date(),
          });
        } catch (error) {
          console.error("Error handling answer submission:", error);
        }
      }
    );

    socket.on("game:question-next", async (data: { lobbyId: string; questionData: any }) => {
      try {
        // Broadcast new question to all players in lobby
        io.to(`lobby:${data.lobbyId}`).emit("game:new-question", data.questionData);
      } catch (error) {
        console.error("Error handling next question:", error);
      }
    });

    socket.on("game:completed", async (data: { lobbyId: string; results: any }) => {
      try {
        // Broadcast game completion to all players in lobby
        io.to(`lobby:${data.lobbyId}`).emit("game:finished", data.results);
      } catch (error) {
        console.error("Error handling game completion:", error);
      }
    });

    // Lobby updates
    socket.on("lobby:update", async (data: { lobbyId: string; lobbyData: any }) => {
      try {
        // Broadcast lobby updates to all players in lobby
        socket.to(`lobby:${data.lobbyId}`).emit("lobby:updated", data.lobbyData);
      } catch (error) {
        console.error("Error handling lobby update:", error);
      }
    });

    socket.on("lobby:game-starting", async (data: { lobbyId: string }) => {
      try {
        // Notify all players that game is starting
        io.to(`lobby:${data.lobbyId}`).emit("lobby:game-start", {
          message: "Game is starting...",
          countdown: 3,
        });
      } catch (error) {
        console.error("Error handling game start:", error);
      }
    });

    // Handle disconnection
    socket.on("disconnect", async () => {
      try {
        const { playerId, lobbyId } = socket.data as SocketData;

        if (playerId) {
          // Update player offline status
          await prisma.player
            .update({
              where: { id: playerId },
              data: { isOnline: false },
            })
            .catch(() => {
              // Player might have been deleted, ignore error
            });

          if (lobbyId) {
            // Notify lobby that player disconnected
            socket.to(`lobby:${lobbyId}`).emit("lobby:player-disconnected", {
              playerId,
            });
          }
        }

        console.log(`Player disconnected: ${socket.id}`);
      } catch (error) {
        console.error("Error handling disconnect:", error);
      }
    });

    // Send initial connection acknowledgment
    socket.emit("connected", {
      socketId: socket.id,
      timestamp: new Date(),
    });
  });

  // Helper functions for emitting events from other parts of the app
  const socketUtils = {
    // Notify lobby of updates
    notifyLobbyUpdate: (lobbyId: string, data: any) => {
      io.to(`lobby:${lobbyId}`).emit("lobby:updated", data);
    },

    // Notify player specifically
    notifyPlayer: (playerId: string, event: string, data: any) => {
      io.to(`player:${playerId}`).emit(event, data);
    },

    // Broadcast to all connected clients
    broadcast: (event: string, data: any) => {
      io.emit(event, data);
    },

    // Get connected players count
    getConnectedPlayersCount: async () => {
      const sockets = await io.fetchSockets();
      return sockets.length;
    },

    // Get players in a lobby
    getPlayersInLobby: async (lobbyId: string) => {
      const sockets = await io.in(`lobby:${lobbyId}`).fetchSockets();
      return sockets.map((socket) => ({
        socketId: socket.id,
        playerId: socket.data.playerId,
      }));
    },
  };

  return socketUtils;
};
