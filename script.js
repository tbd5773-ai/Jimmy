const state = document.getElementById("state");
const core = document.querySelector(".core-section");
const webcam = document.getElementById("webcam");

// 1. ขออนุญาตใช้งานกล้องและไมโครโฟน (Media Capture API)
async function initMediaDevices() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { width: 640, height: 480 },
      audio: true
    });
    
    webcam.srcObject = stream;
    state.textContent = "CLICK TO SPEAK";
  } catch (err) {
    console.error("Access denied:", err);
    state.textContent = "CAM/MIC ACCESS DENIED";
  }
}

// 2. ตั้งค่า Speech Recognition (ฟังเสียง)
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition;

if (SpeechRecognition) {
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
} else {
  state.textContent = "VOICE NOT SUPPORTED";
}

// คลิกที่ Core เพื่อกดพูด
core.addEventListener("click", () => {
  if (!recognition) return;
  recognition.start();
});

function resetState() {
  core.classList.remove("listening");
  state.textContent = "CLICK TO SPEAK";
}

// 3. ประมวลผลคำสั่งเสียง
function handleCommand(message) {
  state.textContent = "THINKING...";

  setTimeout(() => {
    const response = getJarvisResponse(message);
    speak(response);
  }, 500);
}

function getJarvisResponse(message) {
  const text = message.toLowerCase();

  if (text.includes("hello") || text.includes("hi")) {
    return "Hello, sir. How can I help you?";
  }
  if (text.includes("who are you")) {
    return "I am JARVIS, your personal voice assistant.";
  }
  if (text.includes("time")) {
    return `The time is ${new Date().toLocaleTimeString()}.`;
  }
  if (text.includes("open youtube")) {
    window.open("https://youtube.com", "_blank");
    return "Opening YouTube, sir.";
  }

  return `You said: ${message}`;
}

// 4. ระบบตอบกลับด้วยเสียง (Text to Speech)
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

// เริ่มต้นเปิดระบบกล้องและไมค์ทันทีเมื่อโหลดหน้าเว็บ
initMediaDevices();
