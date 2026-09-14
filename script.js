const state = document.getElementById("state");
const core = document.querySelector(".core-section");
const webcam = document.getElementById("webcam");
const startOverlay = document.getElementById("startOverlay");
const startBtn = document.getElementById("startBtn");

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition;

// เริ่มต้นระบบเมื่อผู้ใช้กดปุ่ม
startBtn.addEventListener("click", async () => {
  startOverlay.style.display = "none";
  await initMediaDevices();
  initSpeechRecognition();
});

// 1. ขออนุญาตใช้กล้องและไมค์
async function initMediaDevices() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "user" },
      audio: true
    });
    webcam.srcObject = stream;
    state.textContent = "TAP CORE TO SPEAK";
  } catch (err) {
    state.textContent = "REQUIRES HTTPS OR PERMISSION";
    alert("กรุณาเปิดผ่าน HTTPS หรืออนุญาตให้ใช้งานกล้อง/ไมค์");
  }
}

// 2. ตั้งค่าการจำเสียง
function initSpeechRecognition() {
  if (!SpeechRecognition) {
    state.textContent = "SPEECH API NOT SUPPORTED";
    return;
  }

  recognition = new SpeechRecognition();
  recognition.continuous = false;
  recognition.lang = "en-US";

  recognition.onstart = () => {
    core.classList.add("listening");
    state.textContent = "LISTENING...";
  };

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    handleCommand(transcript);
  };

  recognition.onerror = () => resetState();
  recognition.onend = () => resetState();
}

core.addEventListener("click", () => {
  if (recognition) {
    try {
      recognition.start();
    } catch (e) {
      // ป้องกันการกดซ้ำขณะระบบกำลังฟัง
    }
  }
});

function resetState() {
  core.classList.remove("listening");
  state.textContent = "TAP CORE TO SPEAK";
}

function handleCommand(message) {
  state.textContent = "THINKING...";
  setTimeout(() => {
    const response = getJarvisResponse(message);
    speak(response);
  }, 500);
}

function getJarvisResponse(message) {
  const text = message.toLowerCase();
  if (text.includes("hello") || text.includes("hi")) return "Hello, sir. How can I help you?";
  if (text.includes("time")) return `The time is ${new Date().toLocaleTimeString()}.`;
  return `You said: ${message}`;
}

function speak(text) {
  if (!("speechSynthesis" in window)) {
    resetState();
    return;
  }
  speechSynthesis.cancel();
  const speech = new SpeechSynthesisUtterance(text);
  speech.lang = "en-US";
  speech.rate = 0.95;

  speech.onstart = () => {
    state.textContent = "SPEAKING...";
    core.classList.add("listening");
  };

  speech.onend = () => resetState();
  speech.onerror = () => resetState();

  speechSynthesis.speak(speech);
}
