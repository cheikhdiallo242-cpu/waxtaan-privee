const socket = io();

// ELEMENTS
const joinBtn = document.getElementById("join");
const sendBtn = document.getElementById("send");
const recordBtn = document.getElementById("record");

const pseudoInput = document.getElementById("pseudo");
const roomInput = document.getElementById("room");
const passwordInput = document.getElementById("password");

const login = document.getElementById("login");
const chat = document.getElementById("chat");
const error = document.getElementById("error");

const messageInput = document.getElementById("message");
const messages = document.getElementById("messages");
const online = document.getElementById("online-users");

const imageInput = document.getElementById("image");

// 🔐 JOIN ROOM
joinBtn.onclick = () => {
  socket.emit("join-room", {
    pseudo: pseudoInput.value,
    room: roomInput.value,
    password: passwordInput.value
  });
};

socket.on("wrong-password", () => {
  error.textContent = "❌ Mot de passe incorrect";
});

socket.on("users-online", users => {
  login.hidden = true;
  chat.hidden = false;
  online.textContent = "👥 En ligne : " + users.join(", ");
});

// 💬 MESSAGE TEXTE
sendBtn.onclick = () => {
  const msg = messageInput.value.trim();
  if (!msg) return;

  socket.emit("send-message", msg);
  messageInput.value = "";
};

socket.on("new-message", data => {
  const div = document.createElement("div");
  div.innerHTML = `
    <b>${data.pseudo}</b> 
    <small>⏰ ${data.time}</small><br>
    ${data.message}
  `;
  messages.appendChild(div);
});

// 📸 IMAGE
imageInput.onchange = () => {
  const file = imageInput.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    socket.emit("send-image", reader.result);
  };
  reader.readAsDataURL(file);
};

socket.on("new-image", data => {
  const div = document.createElement("div");
  div.innerHTML = `
    <b>${data.pseudo}</b> 
    <small>⏰ ${data.time}</small><br>
    <a href="${data.img}" download="image.png">
      <img src="${data.img}" style="max-width:200px;border-radius:8px;">
    </a>
  `;
  messages.appendChild(div);
});

// 🎤 MESSAGE VOCAL
let recorder;
let chunks = [];

recordBtn.onclick = async () => {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  recorder = new MediaRecorder(stream);

  recorder.start();
  recordBtn.textContent = "⏹️ Stop";

  recorder.ondataavailable = e => chunks.push(e.data);

  recorder.onstop = () => {
    const blob = new Blob(chunks, { type: "audio/webm" });
    chunks = [];

    const reader = new FileReader();
    reader.onloadend = () => {
      socket.emit("voice-message", reader.result);
    };
    reader.readAsDataURL(blob);

    recordBtn.textContent = "🎤 Message vocal";
  };

  recordBtn.onclick = () => recorder.stop();
};

socket.on("new-voice", data => {
  const div = document.createElement("div");
  div.innerHTML = `
    <b>${data.pseudo}</b> 
    <small>⏰ ${data.time}</small><br>
    <audio controls src="${data.audio}"></audio>
  `;
  messages.appendChild(div);
});
