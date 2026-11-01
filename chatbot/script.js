
const API_URL = "https://galaxy-ai-api.master-raghav09.workers.dev";

const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const messages = document.getElementById("messages");
const welcome = document.getElementById("welcome");
const history = document.getElementById("history");
const sendBtn = document.getElementById("sendBtn");

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

function addMessageToChat(chat, role, content) {
  chat.messages.push({ role, content });

  if (role === "user" && chat.title === "New Chat") {
    chat.title = content.slice(0, 25);
  }

  saveChats();
  renderHistory();

  if (currentChat === chat) {
    renderMessages();
  }
}

function addMessage(role, content) {
  if (!currentChat) createChat();
  addMessageToChat(currentChat, role, content);
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

chatForm.addEventListener("submit", async event => {
  event.preventDefault();

  const text = userInput.value.trim();

  if (!text || sendBtn.disabled) return;

  if (!currentChat) createChat();

  const chatAtSend = currentChat;

  addMessageToChat(chatAtSend, "user", text);
  userInput.value = "";

  sendBtn.disabled = true;

  const typing = document.createElement("div");
  typing.className = "message ai-message";
  typing.textContent = "Galaxy AI is thinking...";
  
  if (currentChat === chatAtSend) {
    messages.appendChild(typing);
    messages.scrollTop = messages.scrollHeight;
  }

  try {
    const apiMessages = chatAtSend.messages.slice(-30);

    // Gemini conversations should start with a user message.
    if (apiMessages[0]?.role === "assistant") {
      apiMessages.shift();
    }

    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        messages: apiMessages
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "The AI request failed.");
    }

    if (!data.reply) {
      throw new Error("Gemini returned an empty reply.");
    }

    addMessageToChat(chatAtSend, "assistant", data.reply);

  } catch (error) {
    console.error("Galaxy AI error:", error);

    addMessageToChat(
      chatAtSend,
      "assistant",
      "Sorry! I couldn't connect right now. Please try again. Error: " +
        error.message
    );

  } finally {
    typing.remove();
    sendBtn.disabled = false;

    if (currentChat === chatAtSend) {
      userInput.focus();
    }
  }
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
