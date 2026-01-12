const socket = io();

/* ===== ELEMENTS ===== */
const joinBtn = document.getElementById("join");
const sendBtn = document.getElementById("send");

const pseudo = document.getElementById("pseudo");
const room = document.getElementById("room");
const password = document.getElementById("password");

const login = document.getElementById("login");
const chat = document.getElementById("chat");
const error = document.getElementById("error");

const messageInput = document.getElementById("message");
const messages = document.getElementById("messages");
const online = document.getElementById("online-users");
const imageInput = document.getElementById("imageInput");

/* ===== CONNEXION ===== */
joinBtn.onclick = () => {
  if (!pseudo.value || !room.value || !password.value) {
    error.innerText = "❗ Remplis tous les champs";
    return;
  }

  socket.emit("join-room", {
    pseudo: pseudo.value,
    room: room.value,
    password: password.value
  });
};

socket.on("wrong-password", () => {
  error.innerText = "❌ Mot de passe incorrect";
});

socket.on("users-online", users => {
  login.hidden = true;
  chat.hidden = false;
  online.innerText = "👥 En ligne : " + users.join(", ");
});

/* ===== MESSAGE TEXTE ===== */
sendBtn.onclick = () => {
  if (!messageInput.value) return;
  socket.emit("send-message", messageInput.value);
  messageInput.value = "";
};

socket.on("new-message", data => {
  const div = document.createElement("div");
  div.className = "message";
  div.innerText = `[${data.time}] ${data.pseudo} : ${data.message}`;
  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
});

/* ===== IMAGE ===== */
imageInput.onchange = e => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    socket.emit("send-image", reader.result);
  };
  reader.readAsDataURL(file);
};

socket.on("new-image", data => {
  const div = document.createElement("div");
  div.className = "message";
  div.innerHTML = `
    <b>[${data.time}] ${data.pseudo}</b><br>
    <img src="${data.img}" style="max-width:200px;border-radius:6px;margin:5px 0;">
    <br>
    <a href="${data.img}" download="waxtaan-image.png">⬇️ Télécharger</a>
  `;
  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
});
