const messagesEl = document.getElementById("messages");
const inputEl = document.getElementById("input");
const sendBtn = document.getElementById("send");
const newChatBtn = document.getElementById("newChat");

function addMessage(role, text) {
  const msg = document.createElement("div");
  msg.className = `message ${role}`;
  const bubble = document.createElement("div");
  bubble.className = "bubble";
  bubble.textContent = text;
  msg.appendChild(bubble);
  messagesEl.appendChild(msg);
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

async function sendMessage() {
  const text = inputEl.value.trim();
  if (!text) return;
  inputEl.value = "";
  sendBtn.disabled = true;
  addMessage("user", text);
  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text })
    });
    const data = await res.json();
    if (!res.ok) {
      addMessage("ai", data.error || "發生錯誤，請稍後再試");
    } else {
      addMessage("ai", data.reply);
    }
  } catch (e) {
    addMessage("ai", "連線失敗，請稍後再試");
  } finally {
    sendBtn.disabled = false;
  }
}

// Enter 送出、Shift+Enter 換行
inputEl.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});

sendBtn.addEventListener("click", sendMessage);

newChatBtn.addEventListener("click", () => {
  messagesEl.innerHTML = "";
  addMessage("ai", "已開始新對話，請輸入問題。");
});