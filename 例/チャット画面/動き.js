// する チャットの画面。会話はこの画面が覚えて、送るたびに全部をサーバーへ送ります。
// サーバーは答えを1行1つの JSON({"content":"…"} か {"error":"…"})で少しずつ返します。

const 会話欄 = document.getElementById("会話");
const 入力欄 = document.getElementById("入力欄");
const 文欄 = document.getElementById("文");
const 送るボタン = document.getElementById("送る");
const 止めるボタン = document.getElementById("止める");
let 履歴 = [];
let 中断 = null;

fetch("api/info")
  .then((r) => r.json())
  .then((s) => { document.getElementById("設定").textContent = `${s.model} — ${s.url}`; })
  .catch(() => { document.getElementById("設定").textContent = "設定を読めませんでした"; });

function 発言を足す(役, 内容) {
  const el = document.createElement("div");
  el.className = `発言 ${役}`;
  el.textContent = 内容;
  会話欄.appendChild(el);
  会話欄.scrollTop = 会話欄.scrollHeight;
  return el;
}

function 送受中にする(中) {
  送るボタン.hidden = 中;
  止めるボタン.hidden = !中;
  文欄.disabled = 中;
}

async function 送る() {
  const 質問 = 文欄.value.trim();
  if (!質問 || 中断) return;
  文欄.value = "";
  履歴.push({ role: "user", content: 質問 });
  発言を足す("user", 質問);
  const 答え欄 = 発言を足す("assistant 待ち", "");
  let 答え = "";
  let 誤り = "";
  中断 = new AbortController();
  送受中にする(true);
  try {
    const r = await fetch("api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: 履歴 }),
      signal: 中断.signal,
    });
    if (!r.ok) throw new Error(`${r.status} ${await r.text()}`);
    const 読み手 = r.body.pipeThrough(new TextDecoderStream()).getReader();
    let 残り = "";
    for (;;) {
      const { value, done } = await 読み手.read();
      if (done) break;
      残り += value;
      const 行一覧 = 残り.split("\n");
      残り = 行一覧.pop();
      for (const 行 of 行一覧) {
        if (!行.trim()) continue;
        const 通知 = JSON.parse(行);
        if (通知.content) 答え += 通知.content;
        if (通知.error) 誤り = 通知.error;
        答え欄.textContent = 答え;
        会話欄.scrollTop = 会話欄.scrollHeight;
      }
    }
  } catch (e) {
    if (e.name !== "AbortError") 誤り = String(e.message || e);
  }
  答え欄.classList.remove("待ち");
  if (答え) {
    履歴.push({ role: "assistant", content: 答え });
  } else {
    履歴.pop(); // 答えがなければ、質問も履歴から外して送り直せるようにする
  }
  if (誤り) {
    const el = 答え ? 発言を足す("assistant", "") : 答え欄;
    el.classList.add("誤り");
    el.textContent = `失敗しました: ${誤り}`;
  } else if (!答え) {
    答え欄.remove();
  }
  中断 = null;
  送受中にする(false);
  文欄.focus();
}

入力欄.addEventListener("submit", (e) => { e.preventDefault(); 送る(); });
文欄.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey && !e.isComposing) { e.preventDefault(); 送る(); }
});
止めるボタン.addEventListener("click", () => { if (中断) 中断.abort(); });
document.getElementById("新規").addEventListener("click", () => {
  if (中断) 中断.abort();
  履歴 = [];
  会話欄.querySelectorAll(".発言").forEach((el) => el.remove());
  文欄.focus();
});
