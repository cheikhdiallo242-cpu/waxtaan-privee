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

sendBtn.onclick = () => {
  socket.emit("send-message", messageInput.value);
  messageInput.value = "";
};

socket.on("new-message", data => {
  const div = document.createElement("div");
  div.className = "message";
  div.innerText = `${data.pseudo} : ${data.message}`;
  messages.appendChild(div);
});

/* 🎤 VOIX */
let recorder, audioChunks = [];

recordBtn.onclick = async () => {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  recorder = new MediaRecorder(stream);

  recorder.start();
  recordBtn.innerText = "⏹️ Stop";

  recorder.ondataavailable = e => audioChunks.push(e.data);

  recorder.onstop = () => {
    const audioBlob = new Blob(audioChunks);
    audioChunks = [];

    const reader = new FileReader();
    reader.onloadend = () => {
      socket.emit("voice-message", reader.result);
    };
    reader.readAsDataURL(audioBlob);

    recordBtn.innerText = "🎤 Message vocal";
  };

  recordBtn.onclick = () => recorder.stop();
};

socket.on("new-voice", data => {
  const div = document.createElement("div");
  div.innerHTML = `<b>${data.pseudo}</b><br>
    <audio controls src="${data.audio}"></audio>`;
  messages.appendChild(div);
});
