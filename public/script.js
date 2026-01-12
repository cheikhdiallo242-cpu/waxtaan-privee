const socket = io();

const loginDiv = document.getElementById("login");
const chatDiv = document.getElementById("chat");

const joinBtn = document.getElementById("join");
const sendBtn = document.getElementById("send");

const messageInput = document.getElementById("message");
const messagesDiv = document.getElementById("messages");

joinBtn.onclick = () => {
  loginDiv.hidden = true;
  chatDiv.hidden = false;
};

sendBtn.onclick = () => {
  const msg = messageInput.value.trim();
  if (!msg) return;

  socket.emit("message", msg);

  messageInput.value = "";
};

// recevoir message
socket.on("message", msg => {
  const div = document.createElement("div");
  div.textContent = msg;
  messagesDiv.appendChild(div);
});
