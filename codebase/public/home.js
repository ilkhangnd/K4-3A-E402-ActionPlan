const $ = selector => document.querySelector(selector);
const escapeHtml = value => String(value).replace(/[&<>"']/g, char => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[char]));
const api = async (path, options) => { const response = await fetch(path, options); const json = await response.json(); if (!response.ok) throw new Error(json.error || "Không thể gọi dịch vụ."); return json; };
const PROFILE_KEY = "deadline-assistant-profile-v1";
let profile = null;
let sourceCache = [];
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
const views = ["home", "conversation", "sources", "attendance"];
function show(view) { views.forEach(id => $("#" + id).classList.toggle("show", id === view)); $("#home").style.display = view === "home" ? "flex" : "none"; document.querySelectorAll(".nav button").forEach(button => button.classList.toggle("active", button.dataset.view === (view === "home" || view === "conversation" ? "chat" : view))); if (view === "attendance") loadAttendance().catch(error => { $("#attendanceMessage").textContent = error.message; }); }
function message(kind, content) { const item = document.createElement("article"); item.className = `message ${kind}`; item.innerHTML = `<div class="avatar">${kind === "bot" ? "AI" : "Bạn"}</div><div class="bubble-copy">${content}</div>`; $("#conversation").appendChild(item); $("#conversation").scrollTop = $("#conversation").scrollHeight; }
function sourceMarkup(result) {
  if (result.decision !== "answer" || !Array.isArray(result.citations)) return "";
  const references = result.citations.map(id => sourceCache.find(source => source.id === id)).filter(Boolean);
  if (!references.length) return "";
  return `<div class="source source-references"><strong>Tham khảo thêm tại:</strong>${references.map(source => `<a href="${escapeHtml(source.url)}" target="_blank" rel="noreferrer">${escapeHtml(source.title)} ↗</a>`).join("")}</div>`;
}
async function ask(question) { const value = question.trim(); if (!value || !profile) return; show("conversation"); message("user", escapeHtml(value)); message("bot", "Mình đang xem giúp bạn nhé…"); const loading = $("#conversation article:last-child"); try { const result = await api("/api/ask", { method:"POST", headers:{ "Content-Type":"application/json" }, body:JSON.stringify({ question:value, profile:{ practice_class:profile.practice_class, theory_class:profile.theory_class } }) }); loading.remove(); const flag = result.decision === "escalate" ? '<div class="notice">Nếu bạn cần xử lý gấp, hãy gửi @Mod tên bài và thời điểm bạn thao tác để được hỗ trợ nhanh hơn nhé.</div>' : ""; const greeting = result.decision === "answer" && result.reason !== "casual_conversation" ? `Chào ${firstName()}, ` : ""; message("bot", `${escapeHtml(greeting + result.answer)}${flag}${sourceMarkup(result)}`); } catch (error) { loading.remove(); message("bot", `<div class="notice">Mình chưa kết nối được để tra cứu ngay. ${escapeHtml(error.message)}</div>`); } }
async function load() { const [health, sources] = await Promise.all([api("/api/health"), api("/api/sources")]); sourceCache = sources; const ready = health.api_key_configured && health.official_sources > 0; $("#status").textContent = ready ? "Đang hoạt động" : health.api_key_configured ? "Cần nguồn thật" : "Chưa có API key"; $("#status").classList.toggle("ready", ready); $("#loadedSourceCount").textContent = `${sources.length} nguồn đang được chatbot dùng để trả lời`; $("#sourceList").innerHTML = sources.length ? sources.map(source => { const link = source.url.startsWith("https://") ? `<a href="${escapeHtml(source.url)}" target="_blank" rel="noreferrer">Mở nguồn ↗</a>` : '<span class="source-origin">Nguồn đã được nhóm xác thực</span>'; return `<article class="source-card"><div class="source-meta"><code>${escapeHtml(source.id)}</code><span>Phạm vi áp dụng: <b>${escapeHtml(source.audience || "all")}</b></span></div><h3>${escapeHtml(source.title)}</h3><p class="source-content">${escapeHtml(source.content)}</p><div class="source-footer"><span>Ngày nạp: ${escapeHtml(source.published_at || "chưa ghi")}</span>${link}<button class="delete-source" type="button" data-delete-source="${escapeHtml(source.id)}" aria-label="Xoá nguồn ${escapeHtml(source.title)}">Xóa nguồn</button></div></article>`; }).join("") : '<p>Chưa có nguồn nào được nạp.</p>'; }
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
$("#sourceImportForm").addEventListener("submit", async event => {
  event.preventDefault();
  const file = $("#sourceImportFile").files[0];
  const message = $("#sourceImportMessage");
  if (!file) return;
  message.textContent = "Đang kiểm tra và import nguồn…";
  try {
    const sourcePayload = JSON.parse(await file.text());
    const result = await api("/api/sources/import", { method:"POST", headers:{ "Content-Type":"application/json" }, body:JSON.stringify({ sources: sourcePayload }) });
    event.currentTarget.reset();
    message.textContent = `Đã import ${result.imported} nguồn (${result.created} mới, ${result.updated} cập nhật). Bot dùng ngay ở câu hỏi tiếp theo.`;
    await load();
  } catch (error) { message.textContent = `Không thể import: ${error.message}`; }
});
$("#sourceList").addEventListener("click", async event => {
  const button = event.target.closest("[data-delete-source]");
  if (!button) return;
  const id = button.dataset.deleteSource;
  if (!confirm(`Xóa nguồn ${id}? Bot sẽ không dùng nguồn này cho các câu hỏi tiếp theo.`)) return;
  button.disabled = true;
  try {
    await api(`/api/sources/${encodeURIComponent(id)}`, { method: "DELETE" });
    $("#sourceMessage").textContent = `Đã xóa nguồn ${id}.`;
    await load();
  } catch (error) {
    button.disabled = false;
    $("#sourceMessage").textContent = error.message;
  }
});
function attendanceKey() { return $("#attendanceAdminKey").value.trim(); }
function attendanceOptions() { return { headers: { "x-admin-attendance-key": attendanceKey() } }; }
function renderAttendance(sessions) {
  $("#attendanceList").innerHTML = sessions.length ? sessions.map(session => `<article class="attendance-card"><img src="${session.qr_data_url}" alt="QR điểm danh ${escapeHtml(session.title)}"><div><div class="record-line"><b>${escapeHtml(session.title)}</b><span class="scope">${escapeHtml(session.status)}</span></div><p>Phạm vi: ${escapeHtml(session.scope)} · Đã điểm danh: <b>${session.attendance_count}</b></p><p>Kết thúc: ${escapeHtml(new Date(session.ends_at).toLocaleString("vi-VN"))}</p><a href="${escapeHtml(session.checkin_url)}" target="_blank" rel="noreferrer">Mở link điểm danh ↗</a><div class="attendance-actions"><button type="button" data-copy-attendance="${escapeHtml(session.checkin_url)}">Sao chép link</button>${session.status === "open" ? `<button class="danger" type="button" data-close-attendance="${escapeHtml(session.token)}">Đóng phiên</button>` : ""}</div></div></article>`).join("") : '<p>Chưa có phiên điểm danh nào.</p>';
}
async function loadAttendance() {
  const sessions = await api("/api/attendance/sessions", attendanceOptions());
  renderAttendance(sessions);
}
$("#attendanceForm").addEventListener("submit", async event => {
  event.preventDefault();
  const form = event.currentTarget;
  const message = $("#attendanceMessage");
  const publicUrl = form.elements.public_url.value.trim();
  if (/localhost|127\.0\.0\.1/.test(publicUrl)) message.textContent = "Lưu ý: QR localhost chỉ quét được trên chính máy này. Dùng IP mạng nội bộ hoặc tunnel HTTPS để quét bằng điện thoại.";
  try {
    const body = Object.fromEntries(new FormData(form));
    await api("/api/attendance/sessions", { method: "POST", headers: { "Content-Type": "application/json", "x-admin-attendance-key": attendanceKey() }, body: JSON.stringify(body) });
    message.textContent = "Đã mở phiên điểm danh. QR và link ở bên dưới.";
    await loadAttendance();
  } catch (error) { message.textContent = error.message; }
});
$("#attendanceList").addEventListener("click", async event => {
  const copyButton = event.target.closest("[data-copy-attendance]");
  if (copyButton) { await navigator.clipboard.writeText(copyButton.dataset.copyAttendance); copyButton.textContent = "Đã sao chép"; return; }
  const closeButton = event.target.closest("[data-close-attendance]");
  if (!closeButton || !confirm("Đóng phiên này? Sinh viên sẽ không thể điểm danh thêm.")) return;
  try {
    await api(`/api/attendance/${encodeURIComponent(closeButton.dataset.closeAttendance)}/close`, { method: "POST", headers: { "x-admin-attendance-key": attendanceKey() } });
    $("#attendanceMessage").textContent = "Đã đóng phiên điểm danh.";
    await loadAttendance();
  } catch (error) { $("#attendanceMessage").textContent = error.message; }
});
$("#profileForm").addEventListener("submit", event => { event.preventDefault(); const form = event.currentTarget; const values = Object.fromEntries(new FormData(form)); for (const field of ["practice_class", "theory_class"]) { values[field] = normalizeClass(values[field]); form.elements[field].value = values[field]; if (!validClass(values[field])) { form.elements[field].setCustomValidity("Dùng format 3A-E402, 3A-D301 hoặc 3B."); form.elements[field].reportValidity(); return; } form.elements[field].setCustomValidity(""); } localStorage.setItem(PROFILE_KEY, JSON.stringify(values)); setProfileUi(); });
$("#profileButton").addEventListener("click", () => { const form = $("#profileForm"); if (profile) for (const [key, value] of Object.entries(profile)) form.elements[key].value = value; $("#profileSetup").classList.add("show"); });
setProfileUi();
load().catch(error => { $("#status").textContent = "Không kết nối được server"; console.error(error); });
