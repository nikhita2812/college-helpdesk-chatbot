const responses = {
  "hello": "Hi there! 👋 How can I assist you today?",
  "hi": "Hello! 😊 How can I help you?",
  "hey": "Hey! 🙋‍♀️ What can I do for you?",
  "how are you": "I'm just a bot 🤖 but I'm functioning great! How about you?",
  "great": "Glad to hear that! 😊",
  "good": "Awesome! Let me know how I can help. 👍",
  "cool": "😎 Cool! Ask me anything.",
  "nice": "Thanks! I'm here to assist. 🤖",
  "what is the college name": "🏫 The college name is Shri Vishnu Engineering College for Women.",
  "what is the exam schedule": "🗓️ You can check the exam schedule on the college portal under 'Exams' section.",
  "where is the library": "📚 The library is located beside C Block.",
  "how to contact placement cell": "📩 Email placement@svecw.edu or visit the placement office in Block C.",
  "what are college timings": "⏰ College runs from 9:00 AM to 4:30 PM, Monday to Saturday.",
  "who is the principal": "👩‍🏫 The current principal is Dr. G. Srinivasa Rao",
  "how to apply for leave": "📝 You can apply for leave through the student portal under the 'Leave Request' section.",
  "how to get bonafide certificate": "📃 You can request it from the admin office or via student portal.",
  "where can i find syllabus": "📖 You can download the syllabus from the college website.",
  "how many credits for btech": "🎓 You need a minimum of 160 credits to complete B.Tech.",
  "is there a canteen": "🍽️ Yes! The canteen is near Annapurna Dining Hall and open from 9 AM to 8 PM.",
  "when is the next fest": "🎉 The next college fest is scheduled for the first week of January!",
  "thank you": "You're welcome! 😊 Let me know if you have more questions.",
  "thanks": "You're welcome! 🙌 Always here to help.",
  "ok": "Great! If you need anything else, just ask. 👍"
};

function cleanText(text) {
  return text.toLowerCase().replace(/[^\w\s]/gi, '').trim();
}

function getBestMatch(userInput) {
  const cleanedInput = cleanText(userInput);

  if (cleanedInput.includes("time")) {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return `🕒 It's currently ${time}.`;
  }
  if (cleanedInput.includes("date")) {
    const date = new Date().toLocaleDateString();
    return `📅 Today's date is ${date}.`;
  }
  if (cleanedInput.includes("day")) {
    const day = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    return `📆 Today is ${day}.`;
  }

  if (["hi", "hello", "hey"].some(word => cleanedInput.includes(word))) {
    return `Hello! 😊 How can I help you today? Also, how are you doing?`;
  }

  if (cleanedInput.includes("how are you")) {
    return `I'm just a bot 🤖 but I'm functioning great! How about you?`;
  }

  const positiveKeywords = ["great", "good", "cool", "awesome", "nice"];
  if (positiveKeywords.some(word => cleanedInput.includes(word))) {
    return "😄 I'm glad to hear that! Let me know if you need anything else.";
  }

  const keys = Object.keys(responses);
  const match = stringSimilarity.findBestMatch(cleanedInput, keys);
  return match.bestMatch.rating >= 0.5 ? responses[match.bestMatch.target] : null;
}

function sendMessage(voiceText = null) {
  const input = document.getElementById("user-input");
  const chatBox = document.getElementById("chat-box");
  const rawMessage = voiceText || input.value;
  if (!rawMessage.trim()) return;

  appendMessage("You", rawMessage, "user");
  document.getElementById("typing").style.display = "flex";

  const thinkingBubble = document.createElement("div");
  thinkingBubble.classList.add("bubble", "bot", "thinking-bubble");
  thinkingBubble.innerHTML = `<span class="thinking-loader"></span>`;
  chatBox.appendChild(thinkingBubble);
  chatBox.scrollTop = chatBox.scrollHeight;

  setTimeout(() => {
    const reply = getBestMatch(rawMessage) || "🤔 Sorry, I don't understand that yet. Try asking something else.";
    const delay = Math.min(3000, reply.length * 40);

    setTimeout(() => {
      thinkingBubble.remove();
      appendMessage("Bot", reply, "bot");
      speakText(reply); // 🗣️ Bot speaks here!
      document.getElementById("typing").style.display = "none";

      if (rawMessage.toLowerCase().includes("thank you") || rawMessage.toLowerCase().includes("thanks")) {
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      }
    }, delay);
  }, 300);

  input.value = "";
  chatBox.scrollTop = chatBox.scrollHeight;
}

function appendMessage(sender, text, type) {
  const chatBox = document.getElementById("chat-box");

  const bubble = document.createElement("div");
  bubble.classList.add("bubble", type);

  const avatar = document.createElement("img");
  avatar.classList.add("avatar");
  if (type === "bot") avatar.classList.add("bot-floating");

  avatar.src = type === "user"
    ? "https://tse1.mm.bing.net/th/id/OIP.f4ZCgH1Q1vk7p8vmt3FZPgHaHa?pid=Api&P=0&h=180"
    : "https://tse4.mm.bing.net/th/id/OIP.pkZKxw7G6p_WwgPN_bqzywHaHa?pid=Api&P=0&h=180";
  avatar.alt = sender;

  const msg = document.createElement("div");
  msg.classList.add("msg");
  msg.innerText = text;

  if (type === "bot") {
    bubble.appendChild(avatar);
    bubble.appendChild(msg);
  } else {
    bubble.appendChild(msg);
    bubble.appendChild(avatar);
  }

  chatBox.appendChild(bubble);
}

document.getElementById("user-input").addEventListener("keypress", function (e) {
  if (e.key === "Enter") sendMessage();
});

document.getElementById("mode-toggle").addEventListener("change", function () {
  document.body.classList.toggle("dark");
  document.getElementById("mode-label").innerText = this.checked ? "Dark Mode" : "Light Mode";
});

document.getElementById("theme-select")?.addEventListener("change", function () {
  document.body.className = document.body.className.replace(/theme-.+/, "");
  if (this.value) {
    document.body.classList.add("theme-" + this.value);
  }
});

document.getElementById("clear-btn").addEventListener("click", function () {
  document.getElementById("chat-box").innerHTML = "";
});

let recognition;
let isListening = false;

document.getElementById("mic-btn").addEventListener("click", function () {
  const micBtn = document.getElementById("mic-btn");
  const ding = document.getElementById("ding-sound");

  if (!recognition) {
    recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = "en-US";
    recognition.interimResults = true;

    recognition.onresult = (event) => {
      let transcript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        transcript += event.results[i][0].transcript;
      }
      document.getElementById("user-input").value = transcript;
      if (event.results[event.results.length - 1].isFinal) {
        sendMessage(transcript);
        micBtn.innerText = "🎤";
        isListening = false;
      }
    };

    recognition.onend = () => {
      micBtn.innerText = "🎤";
      isListening = false;
    };

    recognition.onerror = (event) => {
      alert("⚠️ Voice recognition failed or was denied.");
      micBtn.innerText = "🎤";
      isListening = false;
    };
  }

  if (!isListening) {
    recognition.start();
    ding.play();
    micBtn.innerText = "🔴 Listening... (Click to stop)";
    isListening = true;
  } else {
    recognition.stop();
    ding.play();
    micBtn.innerText = "🎤";
    isListening = false;
  }
});

function speakText(text) {
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'en-US';
  utterance.pitch = 1;
  utterance.rate = 1;
  utterance.volume = 1;
  window.speechSynthesis.speak(utterance);
}
