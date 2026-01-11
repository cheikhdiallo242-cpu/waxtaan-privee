const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

const rooms = {}; 
// rooms[roomName] = { password: "1234", users: [] }

io.on("connection", socket => {

  socket.on("join-room", ({ pseudo, room, password }) => {

    if (!rooms[room]) {
      rooms[room] = { password, users: [] };
    }

    if (rooms[room].password !== password) {
      socket.emit("wrong-password");
      return;
    }

    socket.join(room);
    socket.room = room;
    socket.pseudo = pseudo;

    rooms[room].users.push({ id: socket.id, pseudo });

    io.to(room).emit(
      "users-online",
      rooms[room].users.map(u => u.pseudo)
    );
  });

  socket.on("send-message", msg => {
    io.to(socket.room).emit("new-message", {
      pseudo: socket.pseudo,
      message: msg
    });
  });

  socket.on("voice-message", audio => {
    io.to(socket.room).emit("new-voice", {
      pseudo: socket.pseudo,
      audio
    });
  });

  socket.on("disconnect", () => {
    const room = socket.room;
    if (!room || !rooms[room]) return;

    rooms[room].users =
      rooms[room].users.filter(u => u.id !== socket.id);

    io.to(room).emit(
      "users-online",
      rooms[room].users.map(u => u.pseudo)
    );
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () =>
  console.log("Waxtaan Privée lancé 🚀")
);
