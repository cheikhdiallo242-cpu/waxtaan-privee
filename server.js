const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

const rooms = {};

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

    rooms[room].users.push(pseudo);

    io.to(room).emit("users-online", rooms[room].users);
  });

  socket.on("send-message", msg => {
    io.to(socket.room).emit("new-message", {
      pseudo: socket.pseudo,
      message: msg,
      time: new Date().toLocaleTimeString()
    });
  });

  socket.on("voice-message", audio => {
    io.to(socket.room).emit("new-voice", {
      pseudo: socket.pseudo,
      audio,
      time: new Date().toLocaleTimeString()
    });
  });

  socket.on("disconnect", () => {
    if (!socket.room) return;
    rooms[socket.room].users =
      rooms[socket.room].users.filter(u => u !== socket.pseudo);

    io.to(socket.room).emit("users-online", rooms[socket.room].users);
  });
});

server.listen(3000, () => {
  console.log("Waxtaan Privée en ligne");
});
