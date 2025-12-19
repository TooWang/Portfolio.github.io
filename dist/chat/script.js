const messagesEl = document.getElementById("messages");
const inputEl = document.getElementById("input");
const sendBtn = document.getElementById("send");
const newChatBtn = document.getElementById("newChat");
const toggleThemeBtn = document.getElementById("toggleTheme");
const attachBtn = document.getElementById("attach");
const fileInput = document.getElementById("fileInput");

let memory = JSON.parse(localStorage.getItem("chat_memory") || "[]");
let currentFileContext = null; // 存放檔案/圖片摘要文字

/* ---------- Memory ---------- */
function saveMemory() {
  localStorage.setItem("chat_memory", JSON.stringify(memory));
}

function renderMemory() {
  messagesEl.innerHTML = "";
  memory.forEach(m => addMessage(m.role, m.content, false));
}

/* ---------- UI ---------- */
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
  document.getElementById("loading")?.remove();
}

/* ---------- File ---------- */
attachBtn.onclick = () => fileInput.click();

fileInput.onchange = async () => {
  const file = fileInput.files[0];
  if (!file) return;

  if (file.size > 2 * 1024 * 1024) {
    alert("檔案請小於 2MB");
    return;
  }

  const base64 = await toBase64(file);
  addMessage("user", `已附加檔案：${file.name}`, false);

  // 先送去後端生成初步摘要/描述
  addLoading();
  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: "",
        file: { name: file.name, type: file.type, data: base64 }
      })
    });

    const data = await res.json();
    removeLoading();

    if (data.reply) {
      currentFileContext = data.reply; // 保存摘要 / 描述
      addMessage("ai", `檔案分析完成，可針對此檔案提問。`, false);
      addMessage("ai", currentFileContext, false);
    } else {
      addMessage("ai", "檔案分析失敗", false);
    }
  } catch {
    removeLoading();
    addMessage("ai", "檔案分析連線失敗", false);
  }
};

function toBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/* ---------- Chat ---------- */
async function sendMessage() {
  const text = inputEl.value.trim();
  if (!text && !currentFileContext) return;

  inputEl.value = "";
  sendBtn.disabled = true;

  addMessage("user", text || "[提問檔案]");

  addLoading();

  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: text,
        context: currentFileContext || null
      })
    });

    const data = await res.json();
    removeLoading();

    addMessage("ai", data.reply || "發生錯誤");
  } catch {
    removeLoading();
    addMessage("ai", "連線失敗，請稍後再試");
  } finally {
    sendBtn.disabled = false;
  }
}

/* ---------- Events ---------- */
inputEl.addEventListener("keydown", e => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});

sendBtn.onclick = sendMessage;

newChatBtn.onclick = () => {
  memory = [];
  currentFileContext = null;
  saveMemory();
  messagesEl.innerHTML = "";
};

toggleThemeBtn.onclick = () => {
  const html = document.documentElement;
  const next = html.dataset.theme === "dark" ? "light" : "dark";
  html.dataset.theme = next;
  localStorage.setItem("theme", next);
};

/* ---------- Init ---------- */
const savedTheme = localStorage.getItem("theme");
if (savedTheme) document.documentElement.dataset.theme = savedTheme;
renderMemory();
