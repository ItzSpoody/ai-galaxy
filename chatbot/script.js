
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
  try {
    localStorage.setItem("galaxyChats", JSON.stringify(conversations));
  } catch (error) {
    console.warn("Chat history storage is full.", error);
  }
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

function addMessageToChat(chat, role, content, extra = {}) {
  chat.messages.push({ role, content, ...extra });

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

    if (message.type === "image" && message.imageData) {
      const caption = document.createElement("p");
      caption.textContent = "Generated image: " + message.content;

      const image = document.createElement("img");
      image.src = "data:image/jpeg;base64," + message.imageData;
      image.alt = message.content;
      image.style.maxWidth = "100%";
      image.style.width = "420px";
      image.style.borderRadius = "12px";
      image.style.display = "block";
      image.style.marginTop = "10px";

      bubble.appendChild(caption);
      bubble.appendChild(image);
    } else {
      bubble.textContent = message.content;
    }

    messages.appendChild(bubble);
  });

  messages.scrollTop = messages.scrollHeight;
}

// RENAME CHAT
function renameChat(chat) {
  const newTitle = prompt("Enter a new chat name:", chat.title);

  if (newTitle === null) return;

  const cleanedTitle = newTitle.trim();

  if (!cleanedTitle) {
    alert("Chat name cannot be empty.");
    return;
  }

  chat.title = cleanedTitle.slice(0, 60);

  saveChats();
  renderHistory();
}

// DELETE ONE CHAT
function deleteChat(chat) {
  const confirmed = confirm(
    'Are you sure you want to delete "' + chat.title + '"?'
  );

  if (!confirmed) return;

  conversations = conversations.filter(item => item !== chat);

  if (currentChat === chat) {
    currentChat = conversations[0] || null;
  }

  saveChats();
  renderHistory();
  renderMessages();
}

// DELETE ALL CHATS
function deleteAllChats() {
  if (conversations.length === 0) return;

  const confirmed = confirm(
    "Delete ALL chat history? This cannot be undone."
  );

  if (!confirmed) return;

  conversations = [];
  currentChat = null;

  saveChats();
  renderHistory();
  renderMessages();
}

// RENDER CHAT HISTORY
function renderHistory() {
  history.innerHTML = "";

  // Delete all button
  if (conversations.length > 0) {
    const clearButton = document.createElement("button");

    clearButton.textContent = "🗑️ Clear all chats";
    clearButton.className = "history-clear-all";

    clearButton.style.color = "#ff6b78";
    clearButton.style.fontSize = "12px";
    clearButton.style.textAlign = "center";
    clearButton.style.marginBottom = "5px";

    clearButton.addEventListener("click", deleteAllChats);

    history.appendChild(clearButton);
  }

  conversations.forEach(chat => {
    const item = document.createElement("div");
    item.className = "history-item";

    // Chat title button
    const chatButton = document.createElement("button");
    chatButton.className = "history-chat";
    chatButton.textContent = "💬 " + chat.title;

    chatButton.addEventListener("click", () => {
      currentChat = chat;
      renderMessages();

      document.querySelector(".sidebar").classList.remove("open");
    });

    // Three-dot menu button
    const menuButton = document.createElement("button");
    menuButton.className = "history-menu-btn";
    menuButton.textContent = "⋮";
    menuButton.title = "Chat options";

    // Dropdown menu
    const dropdown = document.createElement("div");
    dropdown.className = "history-dropdown";
    dropdown.style.display = "none";

    const renameButton = document.createElement("button");
    renameButton.textContent = "✏️ Rename";

    renameButton.addEventListener("click", event => {
      event.stopPropagation();
      renameChat(chat);
    });

    const deleteButton = document.createElement("button");
    deleteButton.textContent = "🗑️ Delete";
    deleteButton.className = "delete-chat";

    deleteButton.addEventListener("click", event => {
      event.stopPropagation();
      deleteChat(chat);
    });

    dropdown.appendChild(renameButton);
    dropdown.appendChild(deleteButton);

    menuButton.addEventListener("click", event => {
      event.stopPropagation();

      const wasOpen = dropdown.style.display === "block";

      document.querySelectorAll(".history-dropdown").forEach(menu => {
        menu.style.display = "none";
      });

      dropdown.style.display = wasOpen ? "none" : "block";
    });

    dropdown.addEventListener("click", event => {
      event.stopPropagation();
    });

    item.appendChild(chatButton);
    item.appendChild(menuButton);
    item.appendChild(dropdown);

    history.appendChild(item);
  });
}

// IMAGE REQUEST DETECTION
function isImageRequest(text) {
  return /^(generate|create|make|draw)\s+(me\s+)?(an?\s+)?(image|picture|photo|artwork|illustration)\b/i.test(text.trim());
}

// CHAT FORM
chatForm.addEventListener("submit", async event => {
  event.preventDefault();

  const text = userInput.value.trim();

  if (!text || sendBtn.disabled) return;

  if (!currentChat) createChat();

  const chatAtSend = currentChat;
  const wantsImage = isImageRequest(text);

  addMessageToChat(chatAtSend, "user", text);
  userInput.value = "";
  sendBtn.disabled = true;

  const typing = document.createElement("div");
  typing.className = "message ai-message";
  typing.textContent = wantsImage
    ? "Galaxy AI is creating your image..."
    : "Galaxy AI is thinking...";

  if (currentChat === chatAtSend) {
    messages.appendChild(typing);
    messages.scrollTop = messages.scrollHeight;
  }

  try {
    let response;
    let data;

    if (wantsImage) {
      response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          action: "generate-image",
          prompt: text
        })
      });

      data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Image generation failed.");
      }

      if (!data.image) {
        throw new Error("The image model returned no image.");
      }

      addMessageToChat(
        chatAtSend,
        "assistant",
        text,
        {
          type: "image",
          imageData: data.image
        }
      );
    } else {
      const apiMessages = chatAtSend.messages
        .filter(message => !message.type)
        .slice(-30)
        .map(message => ({
          role: message.role,
          content: message.content
        }));

      if (apiMessages[0]?.role === "assistant") {
        apiMessages.shift();
      }

      response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          messages: apiMessages
        })
      });

      data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "The AI request failed.");
      }

      if (!data.reply) {
        throw new Error("Galaxy AI returned an empty reply.");
      }

      addMessageToChat(chatAtSend, "assistant", data.reply);
    }

  } catch (error) {
    console.error("Galaxy AI error:", error);

    addMessageToChat(
      chatAtSend,
      "assistant",
      "Sorry! I couldn't complete that request. Please try again. Error: " +
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

// NEW CHAT
document.getElementById("newChatBtn").addEventListener("click", createChat);

// THEME TOGGLE
document.getElementById("themeBtn").addEventListener("click", () => {
  document.body.classList.toggle("light");

  localStorage.setItem(
    "galaxyTheme",
    document.body.classList.contains("light") ? "light" : "dark"
  );
});

// MOBILE SIDEBAR
document.getElementById("menuBtn").addEventListener("click", () => {
  document.querySelector(".sidebar").classList.toggle("open");
});

// CLOSE DROPDOWN WHEN CLICKING OUTSIDE HISTORY
document.addEventListener("click", event => {
  if (!history.contains(event.target)) {
    document.querySelectorAll(".history-dropdown").forEach(menu => {
      menu.style.display = "none";
    });
  }
});

// SUGGESTIONS
document.querySelectorAll(".suggestion").forEach(button => {
  button.addEventListener("click", () => {
    userInput.value = button.textContent.replace(/^.*? /, "");
    userInput.focus();
  });
});

// RESTORE THEME
if (localStorage.getItem("galaxyTheme") === "light") {
  document.body.classList.add("light");
}

// LOAD SAVED CHATS
if (conversations.length > 0) {
  currentChat = conversations[0];
}

renderHistory();
renderMessages();
