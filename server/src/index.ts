import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "*" },
});

interface Position {
  x: number;
  y: number;
}

// 🔥 Proximity radius
const RADIUS = 120;

// 🧠 Distance function
function getDistance(p1: Position, p2: Position) {
  return Math.sqrt(
    (p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2
  );
}

// 👥 Store users
const users: Record<string, Position> = {};

// 🔗 Track connections
const connections: Record<string, Set<string>> = {};

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // default spawn
  users[socket.id] = { x: 100, y: 100 };
  connections[socket.id] = new Set();

  // 🔥 send initial state
  io.emit("users_update", users);

  socket.on("move", (pos: Position) => {
    users[socket.id] = pos;

    // 🔥 PROXIMITY CHECK
    for (let otherId in users) {
      if (otherId === socket.id) continue;

      const dist = getDistance(pos, users[otherId]);
      const alreadyConnected = connections[socket.id].has(otherId);

      // ✅ CONNECT
      if (dist < RADIUS && !alreadyConnected) {
        connections[socket.id].add(otherId);

        if (!connections[otherId]) connections[otherId] = new Set();
        connections[otherId].add(socket.id);

        const roomId = [socket.id, otherId].sort().join("_");

        socket.join(roomId);
        io.sockets.sockets.get(otherId)?.join(roomId);

        socket.emit("connected", { userId: otherId, roomId });
        io.to(otherId).emit("connected", { userId: socket.id, roomId });

        console.log("✅ CONNECTED:", socket.id, otherId);
      }

      // ❌ DISCONNECT
      if (dist >= RADIUS && alreadyConnected) {
        connections[socket.id].delete(otherId);
        connections[otherId]?.delete(socket.id);

        const roomId = [socket.id, otherId].sort().join("_");

        socket.leave(roomId);
        io.sockets.sockets.get(otherId)?.leave(roomId);

        socket.emit("disconnected", { userId: otherId });
        io.to(otherId).emit("disconnected", { userId: socket.id });

        console.log("❌ DISCONNECTED:", socket.id, otherId);
      }
    }

    // 🔄 update all users
    io.emit("users_update", users);
  });

  socket.on("send_message", (data: { roomId: string, message: string }) => {
    const { roomId, message } = data;
    // Broadcast message to everyone in the room except the sender
    socket.to(roomId).emit("receive_message", {
      sender: socket.id,
      message,
      timestamp: new Date().toISOString(),
    });
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);

    // 🔥 cleanup connections
    for (let otherId in connections[socket.id]) {
      connections[otherId]?.delete(socket.id);

      io.to(otherId).emit("disconnected", { userId: socket.id });
    }

    delete connections[socket.id];
    delete users[socket.id];

    io.emit("users_update", users);
  });
});

server.listen(3000, () => {
  console.log("🚀 Server running on port: 3000");
});