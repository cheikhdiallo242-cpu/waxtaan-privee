const socket = io();

const joinBtn = document.getElementById("join");
const sendBtn = document.getElementById("send");
const recordBtn = document.getElementById("record");

const pseudo = document.getElementById("pseudo");
const room = document.getElementById("room");
const password = document.getElementById("password");

const login = document.getElementById("login");
const chat = document.getElementById("chat");
const error = document.getElementById("error");

const messageInput = document.getElementById("message");
const messages = document.getElementById("messages");
const online = document.getElementById("online-users");

/* 🔐 Connexion */
joinBtn.onclick = () => {
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

/* 💬 Messages texte */
sendBtn.onclick = () => {
  if (!messageInput.value) return;
  socket.emit("send-message", messageInput.value);
  messageInput.value = "";
};

socket.on("new-message", data => {
  const div = document.createElement("div");
  div.className = "message";
  div.innerHTML = `<b>[${data.time}] ${data.pseudo}</b><br>${data.message}`;
  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
});

/* 🎤 MESSAGES VOCAUX — VERSION STABLE */
let recorder = null;
let audioChunks = [];
let recording = false;

recordBtn.onclick = async () => {
  if (!recording) {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    recorder = new MediaRecorder(stream);
    audioChunks = [];

    recorder.ondataavailable = e => audioChunks.push(e.data);

    recorder.onstop = () => {
      const blob = new Blob(audioChunks, { type: "audio/webm" });
      const reader = new FileReader();

      reader.onloadend = () => {
        socket.emit("voice-message", reader.result);
      };

      reader.readAsDataURL(blob);
      recordBtn.innerText = "🎤 Message vocal";
    };

    recorder.start();
    recording = true;
    recordBtn.innerText = "⏹️ Stop";
  } else {
    recorder.stop();
    recording = false;
  }
};

socket.on("new-voice", data => {
  const div = document.createElement("div");
  div.className = "message";
  div.innerHTML = `
    <b>[${data.time}] ${data.pseudo}</b><br>
    <audio controls src="${data.audio}"></audio>
  `;
  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
});
