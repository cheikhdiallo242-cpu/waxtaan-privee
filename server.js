const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

io.on("connection", (socket) => {
  console.log("Utilisateur connecté");

  socket.on("joinRoom", ({ username, room }) => {
    socket.username = username;
    socket.room = room;
    socket.join(room);

    socket.to(room).emit(
      "system",
      `👋 ${username} a rejoint le salon`
    );
  });

  socket.on("chat", (message) => {
    io.to(socket.room).emit("chat", {
      user: socket.username,
      message
    });
  });
});

server.listen(process.env.PORT || 3000, () => {
  console.log("Waxtaan Privée est en ligne");
});
