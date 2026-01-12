const socket = io();

const joinBtn = document.getElementById("join");
const sendBtn = document.getElementById("send");
const recordBtn = document.getElementById("record");
const imageInput = document.getElementById("image");

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

/* 💬 Message texte */
sendBtn.onclick = () => {
  if (!messageInput.value) return;
  socket.emit("send-message", messageInput.value);
  messageInput.value = "";
};

socket.on("new-message", data => {
  addMessage(`
    <b>[${data.time}] ${data.pseudo}</b><br>
    ${data.message}
  `);
});

/* 📸 IMAGE (CORRIGÉ) */
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
  addMessage(`
    <b>[${data.time}] ${data.pseudo}</b><br>
    <img src="${data.img}" style="max-width:200px;display:block">
    <a href="${data.img}" download="waxtaan-image.png">⬇️ Télécharger</a>
  `);
});

/* 🎤 MESSAGE VOCAL (CORRIGÉ) */
let recorder;
let chunks = [];
let recording = false;

recordBtn.onclick = async () => {
  if (!recording) {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    recorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
    chunks = [];

    recorder.ondataavailable = e => chunks.push(e.data);

    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: "audio/webm" });
      const reader = new FileReader();
      reader.onload = () => {
        socket.emit("voice-message", reader.result);
      };
      reader.readAsDataURL(blob);
    };

    recorder.start();
    recordBtn.innerText = "⏹️ Stop";
    recording = true;
  } else {
    recorder.stop();
    recordBtn.innerText = "🎤 Message vocal";
    recording = false;
  }
};

socket.on("new-voice", data => {
  addMessage(`
    <b>[${data.time}] ${data.pseudo}</b><br>
    <audio controls src="${data.audio}"></audio>
  `);
});

/* 🔁 UTILITAIRE */
function addMessage(html) {
  const div = document.createElement("div");
  div.className = "message";
  div.innerHTML = html;
  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
}
