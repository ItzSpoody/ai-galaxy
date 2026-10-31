
const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const messages = document.getElementById("messages");
const welcome = document.getElementById("welcome");
const history = document.getElementById("history");

let conversations = JSON.parse(
  localStorage.getItem("galaxyChats") || "[]"
);

let currentChat = null;

function saveChats() {
  localStorage.setItem("galaxyChats", JSON.stringify(conversations));
}

function createChat() {
  currentChat = {
    id: Date.now(),
    title: "New Chat",
    messages: []
  };

  conversations.unshift(currentChat);
  saveChats();
  renderHistory();
  renderMessages();
}

function addMessage(role, content) {
  if (!currentChat) createChat();

  currentChat.messages.push({ role, content });

  if (role === "user" && currentChat.title === "New Chat") {
    currentChat.title = content.slice(0, 25);
  }

  saveChats();
  renderMessages();
  renderHistory();
}

function renderMessages() {
  messages.innerHTML = "";

  const hasMessages = currentChat && currentChat.messages.length > 0;
  welcome.style.display = hasMessages ? "none" : "flex";

  if (!hasMessages) return;

  currentChat.messages.forEach(message => {
    const bubble = document.createElement("div");
    bubble.className = "message " +
      (message.role === "user" ? "user-message" : "ai-message");

    bubble.textContent = message.content;
    messages.appendChild(bubble);
  });

  messages.scrollTop = messages.scrollHeight;
}

function renderHistory() {
  history.innerHTML = "";

  conversations.forEach(chat => {
    const button = document.createElement("button");
    button.textContent = "💬 " + chat.title;

    button.addEventListener("click", () => {
      currentChat = chat;
      renderMessages();
    });

    history.appendChild(button);
  });
}

chatForm.addEventListener("submit", event => {
  event.preventDefault();

  const text = userInput.value.trim();
  if (!text) return;

  addMessage("user", text);
  userInput.value = "";

  // Temporary placeholder until we connect the real AI.
  addMessage(
    "assistant",
    "Galaxy AI is being connected! The real AI engine will be added in the next step. 🌌"
  );
});

document.getElementById("newChatBtn").addEventListener("click", createChat);

document.getElementById("themeBtn").addEventListener("click", () => {
  document.body.classList.toggle("light");

  localStorage.setItem(
    "galaxyTheme",
    document.body.classList.contains("light") ? "light" : "dark"
  );
});

document.getElementById("menuBtn").addEventListener("click", () => {
  document.querySelector(".sidebar").classList.toggle("open");
});

document.querySelectorAll(".suggestion").forEach(button => {
  button.addEventListener("click", () => {
    userInput.value = button.textContent.replace(/^.*? /, "");
    userInput.focus();
  });
});

if (localStorage.getItem("galaxyTheme") === "light") {
  document.body.classList.add("light");
}

if (conversations.length > 0) {
  currentChat = conversations[0];
}

renderHistory();
renderMessages();
