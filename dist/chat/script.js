const messagesEl = document.getElementById("messages");
const inputEl = document.getElementById("input");
const sendBtn = document.getElementById("send");
const newChatBtn = document.getElementById("newChat");
const toggleThemeBtn = document.getElementById("toggleTheme");
const attachBtn = document.getElementById("attach");
const fileInput = document.getElementById("fileInput");
const filePreviewEl = document.getElementById("filePreview");
const tokenStatsEl = document.getElementById("tokenStats");
const totalTokensEl = document.getElementById("totalTokens");
const estimatedCostEl = document.getElementById("estimatedCost");

let memory = JSON.parse(localStorage.getItem("chat_memory") || "[]");
let currentFileContext = null; // 存放檔案/圖片摘要文字
let attachedFile = null; // 延後至送出時一併發送

/* ---------- Token Stats ---------- */
async function loadTokenStats() {
  try {
    const response = await fetch("/api/stats");
    if (!response.ok) throw new Error("Failed to fetch stats");
    
    const stats = await response.json();
    totalTokensEl.textContent = stats.total_tokens.toLocaleString();
    estimatedCostEl.textContent = `$${stats.estimated_cost_usd.toFixed(4)}`;
    
    if (stats.total_tokens > 0) {
      tokenStatsEl.hidden = false;
    }
  } catch (error) {
    console.error("Failed to load token stats:", error);
  }
}

function clearAttachment() {
  attachedFile = null;
  if (filePreviewEl) {
    filePreviewEl.hidden = true;
    filePreviewEl.innerHTML = "";
  }
  fileInput.value = "";
}

function prepareHistory(max = 12) {
  const trimmed = memory.slice(-max);
  return trimmed.map(m => ({
    role: m.role === "ai" ? "assistant" : "user",
    content: m.content
  }));
}

/* ---------- Memory ---------- */
function saveMemory() {
  localStorage.setItem("chat_memory", JSON.stringify(memory));
}

function renderMemory() {
  messagesEl.innerHTML = "";
  memory.forEach(m => addMessage(m.role, m.content, false, m.image || null, m.usage || null));
}

/* ---------- UI ---------- */
function addMessage(role, text, save = true, image = null, usage = null) {
  const msg = document.createElement("div");
  msg.className = `message ${role}`;

  const bubble = document.createElement("div");
  bubble.className = "bubble";
  
  // 如果有圖片，先顯示圖片
  if (image) {
    const img = document.createElement("img");
    img.src = image.src;
    img.alt = image.name || "上傳的圖片";
    bubble.appendChild(img);
    
    // 如果有文字，在圖片下方顯示
    if (text) {
      const textDiv = document.createElement("div");
      textDiv.style.marginTop = "8px";
      textDiv.innerHTML = role === "ai" ? marked.parse(text) : text;
      bubble.appendChild(textDiv);
    }
  } else {
    // 沒有圖片時的原有邏輯
    bubble.innerHTML = role === "ai" ? marked.parse(text) : text;
  }

  msg.appendChild(bubble);
  messagesEl.appendChild(msg);
  messagesEl.scrollTop = messagesEl.scrollHeight;

  if (save) {
    memory.push({ role, content: text, image, usage });
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

/* ---------- Textarea Auto-Resize ---------- */
function autoResize() {
  if (!inputEl) return;
  inputEl.style.height = "auto";
  const max = 240; // sync with CSS max-height
  const next = Math.min(inputEl.scrollHeight, max);
  inputEl.style.height = next + "px";
  inputEl.style.overflowY = inputEl.scrollHeight > max ? "auto" : "hidden";
}

/* ---------- File (defer analysis until send) ---------- */
attachBtn.onclick = () => fileInput.click();

fileInput.onchange = async () => {
  const file = fileInput.files[0];
  if (!file) return;

  if (file.size > 2 * 1024 * 1024) {
    alert("檔案請小於 2MB");
    fileInput.value = "";
    return;
  }

  try {
    const base64 = await toBase64(file);
    attachedFile = { name: file.name, type: file.type, data: base64 };
    if (file.type && file.type.startsWith("image/")) {
      const src = `data:${file.type};base64,${base64}`;
      if (filePreviewEl) {
        filePreviewEl.innerHTML = `
          <img src="${src}" alt="${file.name}">
          <button class="remove" type="button" aria-label="移除附件">×</button>
          <div class="caption">已附加圖片：${file.name}</div>
        `;
        filePreviewEl.hidden = false;
        const btn = filePreviewEl.querySelector('.remove');
        if (btn) btn.onclick = clearAttachment;
      }
    } else if (filePreviewEl) {
      filePreviewEl.innerHTML = `
        <div class="caption">已附加檔案：${file.name}</div>
        <button class="remove" type="button" aria-label="移除附件">×</button>
      `;
      filePreviewEl.hidden = false;
      const btn = filePreviewEl.querySelector('.remove');
      if (btn) btn.onclick = clearAttachment;
    }
  } catch (e) {
    console.error("檔案讀取失敗", e);
    alert("檔案讀取失敗，請重試");
    clearAttachment();
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
  // 允許僅圖片（或檔案）時也能送出
  if (!text && !attachedFile && !currentFileContext) return;

  inputEl.value = "";
  sendBtn.disabled = true;
  autoResize();

  // 如果有圖片附件，保存圖片信息以便顯示在對話框中
  let userImage = null;
  if (attachedFile && attachedFile.type && attachedFile.type.startsWith("image/")) {
    userImage = {
      src: `data:${attachedFile.type};base64,${attachedFile.data}`,
      name: attachedFile.name
    };
  }

  // 訊息文字：若只有圖片則使用友善提示
  const displayText = (!text && userImage) ? "": (text || "[提問檔案]");
  addMessage("user", displayText, true, userImage);

  addLoading();

  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: text,
        context: currentFileContext || null,
        history: prepareHistory(12),
        file: attachedFile
      })
    });

    const data = await res.json();
    removeLoading();

    addMessage("ai", data.reply || "發生錯誤", true, null, data.usage || null);
    
    // 更新 token 統計
    if (data.usage) {
      loadTokenStats();
    }
  } catch {
    removeLoading();
    addMessage("ai", "連線失敗，請稍後再試");
  } finally {
    sendBtn.disabled = false;
    // reset attachment after send
    clearAttachment();
  }
}

/* ---------- Events ---------- */
inputEl.addEventListener("keydown", e => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});
inputEl.addEventListener("input", autoResize);

sendBtn.onclick = sendMessage;

newChatBtn.onclick = () => {
  memory = [];
  currentFileContext = null;
  saveMemory();
  messagesEl.innerHTML = "";
  loadTokenStats();
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
autoResize();
loadTokenStats();
