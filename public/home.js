const $ = selector => document.querySelector(selector);
const escapeHtml = value => String(value).replace(/[&<>"']/g, char => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[char]));
const api = async (path, options) => { const response = await fetch(path, options); const json = await response.json(); if (!response.ok) throw new Error(json.error || "Không thể gọi dịch vụ."); return json; };
const PROFILE_KEY = "deadline-assistant-profile-v1";
let profile = null;
function getProfile() { try { const saved = JSON.parse(localStorage.getItem(PROFILE_KEY)); return saved?.name && saved?.student_id && saved?.practice_class && saved?.theory_class ? saved : null; } catch { return null; } }
function normalizeClass(value) { return value.trim().toUpperCase().replace(/\s+/g, ""); }
function validClass(value) { return /^[0-9]+[A-Z](?:-[A-Z][0-9]{3})?$/.test(value); }
function firstName() { return profile?.name.trim().split(/\s+/).at(-1) || "bạn"; }
function setProfileUi() {
  profile = getProfile();
  $("#profileSetup").classList.toggle("show", !profile);
  $("#profileButton").textContent = profile ? firstName().slice(0, 1).toUpperCase() : "●";
  $("#profileButton").title = profile ? `Hồ sơ của ${profile.name}` : "Thiết lập hồ sơ";
  const heading = $(".greeting h2");
  heading.replaceChildren("Xin chào ", document.createTextNode(profile ? `${firstName()}! ` : "bạn! "), Object.assign(document.createElement("span"), { textContent:"Mình giúp gì cho bạn?" }));
}
const views = ["home", "conversation", "sources"];
function show(view) { views.forEach(id => $("#" + id).classList.toggle("show", id === view)); $("#home").style.display = view === "home" ? "flex" : "none"; document.querySelectorAll(".nav button").forEach(button => button.classList.toggle("active", button.dataset.view === (view === "home" || view === "conversation" ? "chat" : view))); }
function message(kind, content) { const item = document.createElement("article"); item.className = `message ${kind}`; item.innerHTML = `<div class="avatar">${kind === "bot" ? "AI" : "Bạn"}</div><div class="bubble-copy">${content}</div>`; $("#conversation").appendChild(item); $("#conversation").scrollTop = $("#conversation").scrollHeight; }
function sourceMarkup() { return ""; }
async function ask(question) { const value = question.trim(); if (!value || !profile) return; show("conversation"); message("user", escapeHtml(value)); message("bot", "Mình đang xem giúp bạn nhé…"); const loading = $("#conversation article:last-child"); try { const result = await api("/api/ask", { method:"POST", headers:{ "Content-Type":"application/json" }, body:JSON.stringify({ question:value, profile:{ practice_class:profile.practice_class, theory_class:profile.theory_class } }) }); loading.remove(); const flag = result.decision === "escalate" ? '<div class="notice">Nếu bạn cần xử lý gấp, hãy gửi @Mod tên bài và thời điểm bạn thao tác để được hỗ trợ nhanh hơn nhé.</div>' : ""; const greeting = result.decision === "answer" && result.reason !== "casual_conversation" ? `Chào ${firstName()}, ` : ""; message("bot", `${escapeHtml(greeting + result.answer)}${flag}${sourceMarkup(result)}`); } catch (error) { loading.remove(); message("bot", `<div class="notice">Mình chưa kết nối được để tra cứu ngay. ${escapeHtml(error.message)}</div>`); } }
async function load() { const [health, sources] = await Promise.all([api("/api/health"), api("/api/sources")]); const ready = health.api_key_configured && health.official_sources > 0; $("#status").textContent = ready ? "Đang hoạt động" : health.api_key_configured ? "Cần nguồn thật" : "Chưa có API key"; $("#status").classList.toggle("ready", ready); $("#loadedSourceCount").textContent = `${sources.length} nguồn đang được chatbot dùng để trả lời`; $("#sourceList").innerHTML = sources.length ? sources.map(source => { const link = source.url.startsWith("https://") ? `<a href="${escapeHtml(source.url)}" target="_blank" rel="noreferrer">Mở nguồn ↗</a>` : '<span class="source-origin">Nguồn đã được nhóm xác thực</span>'; return `<article class="source-card"><div class="source-meta"><code>${escapeHtml(source.id)}</code><span>Phạm vi áp dụng: <b>${escapeHtml(source.audience || "all")}</b></span></div><h3>${escapeHtml(source.title)}</h3><p class="source-content">${escapeHtml(source.content)}</p><div class="source-footer"><span>Ngày nạp: ${escapeHtml(source.published_at || "chưa ghi")}</span>${link}</div></article>`; }).join("") : '<p>Chưa có nguồn nào được nạp.</p>'; }
$("#composer").addEventListener("submit", event => { event.preventDefault(); ask($("#question").value); $("#question").value = ""; });
document.querySelectorAll("[data-question]").forEach(button => button.addEventListener("click", () => ask(button.dataset.question)));
document.querySelectorAll(".nav button").forEach(button => button.addEventListener("click", () => show(button.dataset.view === "chat" ? "home" : button.dataset.view)));
$("#sourceForm").addEventListener("submit", async event => {
  event.preventDefault();
  const form = event.currentTarget;
  const message = $("#sourceMessage");
  const source = Object.fromEntries(new FormData(form));
  message.textContent = "Đang lưu nguồn…";
  try {
    await api("/api/sources", { method:"POST", headers:{ "Content-Type":"application/json" }, body:JSON.stringify(source) });
    form.reset();
    message.textContent = "Đã lưu nguồn chính thức. Trợ lý có thể dùng nguồn này ngay.";
    await load();
  } catch (error) { message.textContent = error.message; }
});
$("#profileForm").addEventListener("submit", event => { event.preventDefault(); const form = event.currentTarget; const values = Object.fromEntries(new FormData(form)); for (const field of ["practice_class", "theory_class"]) { values[field] = normalizeClass(values[field]); form.elements[field].value = values[field]; if (!validClass(values[field])) { form.elements[field].setCustomValidity("Dùng format 3A-E402, 3A-D301 hoặc 3B."); form.elements[field].reportValidity(); return; } form.elements[field].setCustomValidity(""); } localStorage.setItem(PROFILE_KEY, JSON.stringify(values)); setProfileUi(); });
$("#profileButton").addEventListener("click", () => { const form = $("#profileForm"); if (profile) for (const [key, value] of Object.entries(profile)) form.elements[key].value = value; $("#profileSetup").classList.add("show"); });
setProfileUi();
load().catch(error => { $("#status").textContent = "Không kết nối được server"; console.error(error); });
