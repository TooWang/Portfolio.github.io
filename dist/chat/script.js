const messagesEl = document.getElementById("messages");
const inputEl = document.getElementById("input");
const sendBtn = document.getElementById("send");
const newChatBtn = document.getElementById("newChat");
/* ---------- Memory ---------- */
let memory = JSON.parse(localStorage.getItem("chat_memory") || "[]");

function saveMemory() {
  localStorage.setItem("chat_memory", JSON.stringify(memory));
}

function renderMemory() {
  messagesEl.innerHTML = "";
  memory.forEach(m => addMessage(m.role, m.content, false));
}

/* ---------- UI Helpers ---------- */
function addMessage(role, text, save = true) {
  const msg = document.createElement("div");
  msg.className = `message ${role}`;

  const bubble = document.createElement("div");
  bubble.className = "bubble";
  bubble.innerHTML = role === "ai" ? marked.parse(text) : text;

  msg.appendChild(bubble);
  messagesEl.appendChild(msg);
  messagesEl.scrollTop = messagesEl.scrollHeight;

  if (save) {
    memory.push({ role, content: text });
    saveMemory();
  }
}

function addLoading() {
  const msg = document.createElement("div");
  msg.id = "loading";
  msg.className = "message ai";
  msg.innerHTML = `<div class="bubble loading">AI 輸入中…</div>`;
  messagesEl.appendChild(msg);
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

function removeLoading() {
  const el = document.getElementById("loading");
  if (el) el.remove();
}

/* ---------- Chat ---------- */
async function sendMessage() {
  const text = inputEl.value.trim();
  if (!text) return;

  inputEl.value = "";
  sendBtn.disabled = true;

  addMessage("user", text);
  addLoading();

  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text })
    });

    const data = await res.json();
    removeLoading();

    addMessage(
      "ai",
      res.ok ? data.reply : data.error || "發生錯誤，請稍後再試"
    );
  } catch (err) {
    removeLoading();
    addMessage("ai", "連線失敗，請稍後再試");
  } finally {
    sendBtn.disabled = false;
  }
}

/* ---------- Events ---------- */
inputEl.addEventListener("keydown", e => {
  if (e.key === "Enter" && !e.ctrlKey) {
    e.preventDefault();
    sendMessage();
  }
});

sendBtn.addEventListener("click", sendMessage);

newChatBtn.addEventListener("click", () => {
  memory = [];
  saveMemory();
  messagesEl.innerHTML = "";
});

renderMemory();
