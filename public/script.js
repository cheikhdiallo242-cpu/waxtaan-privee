const socket = io();

let joined = false;

function join() {
  const username = document.getElementById("name").value;
  const room = document.getElementById("room").value;

  if (!username || !room) {
    alert("Entre ton pseudo et le nom du salon");
    return;
  }

  socket.emit("joinRoom", { username, room });
  joined = true;

  document.getElementById("chat").innerHTML +=
    `<p><i>🔒 Salon <b>${room}</b> rejoint</i></p>`;
}

function send() {
  if (!joined) {
    alert("Entre d'abord dans un salon");
    return;
  }

  const input = document.getElementById("msg");
  const message = input.value;

  if (!message) return;

  socket.emit("chat", message);
  input.value = "";
}

socket.on("chat", data => {
  document.getElementById("chat").innerHTML +=
    `<p><b>${data.user}</b> : ${data.message}</p>`;
});

socket.on("system", msg => {
  document.getElementById("chat").innerHTML +=
    `<p><i>${msg}</i></p>`;
});
