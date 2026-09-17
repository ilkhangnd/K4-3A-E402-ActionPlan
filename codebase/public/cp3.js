const $ = selector => document.querySelector(selector);
const escapeHtml = text => String(text).replace(/[&<>"']/g, char => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[char]));
const stamp = () => new Date().toLocaleTimeString("vi-VN", { hour:"2-digit", minute:"2-digit" });
const request = async (path, options) => {
  const response = await fetch(path, options);
  const payload = await response.json();
  if (!response.ok) throw new Error(payload.error || "Không thể gọi dịch vụ.");
  return payload;
};
function addMessage(kind, html) {
  $("#empty")?.remove();
  const item = document.createElement("div");
  if (kind === "system") { item.className = "system"; item.innerHTML = html; }
  else { item.className = `message ${kind}`; item.innerHTML = `<div class="avatar">${kind === "bot" ? "TL" : "Bạn"}</div><div><div class="meta"><b>${kind === "bot" ? "Trợ lý" : "Bạn"}</b>${stamp()}</div><div class="copy">${html}</div></div>`; }
  $("#log").appendChild(item);
}
function clearChat() {
  $("#log").innerHTML = '<div class="empty" id="empty"><strong>Hỏi một mốc thời gian bất kỳ</strong>Trợ lý sẽ gọi API thật và chỉ dùng thông báo chính thức đã import.</div>';
}
function renderSources(sources, filter = "") {
  const query = filter.trim().toLocaleLowerCase("vi-VN");
  const visible = sources.filter(source => !query || `${source.title} ${source.excerpt} ${source.audience}`.toLocaleLowerCase("vi-VN").includes(query));
  $("#count").textContent = `${sources.length} nguồn`;
  $("#records").innerHTML = visible.length ? visible.map(source => `<article class="record"><div class="record-line"><code>${escapeHtml(source.id)}</code><span class="scope">${escapeHtml(source.audience)}</span></div><h3>${escapeHtml(source.title)}</h3><p>${escapeHtml(source.excerpt)}${source.excerpt.length === 180 ? "…" : ""}</p><div class="record-footer"><span class="source-pill">Nguồn chính thức</span><a class="icon" href="${escapeHtml(source.url)}" target="_blank" rel="noreferrer" aria-label="Mở nguồn">↗</a></div></article>`).join("") : '<div class="empty"><strong>Chưa có nguồn chính thức</strong>Hãy import dữ liệu thật rồi tải lại.</div>';
}
let sourceCache = [];
async function load() {
  const [health, cases, sources] = await Promise.all([request("/api/health"), request("/api/test-cases"), request("/api/sources")]);
  sourceCache = sources;
  const ready = health.api_key_configured && health.official_sources > 0;
  $("#apiStatus").textContent = ready ? `CP3 · API sẵn sàng · ${health.official_sources} nguồn` : `CP3 · ${health.api_key_configured ? "thiếu nguồn thật" : "thiếu API key"}`;
  $("#sourceStatus").textContent = `${health.official_sources} nguồn chính thức · ${cases.length} test`;
  renderSources(sources, $("#dbSearch").value);
  $("#chips").innerHTML = cases.slice(0, 6).map(test => `<button class="chip" data-question="${escapeHtml(test.question)}"><b>${escapeHtml(test.question)}</b><span>${escapeHtml(test.scenario)}</span></button>`).join("");
}
async function ask(question) {
  const value = question.trim();
  if (!value) return;
  addMessage("user", escapeHtml(value));
  addMessage("system", "Đang gọi API thật và kiểm tra trích dẫn…");
  try {
    const result = await request("/api/ask", { method:"POST", headers:{ "Content-Type":"application/json" }, body:JSON.stringify({ question:value }) });
    $("#log .system:last-of-type")?.remove();
    const citations = result.citations.length ? result.citations.map(escapeHtml).join(" · ") : "Không có nguồn — đã chuyển Mod";
    const proof = result.evidence.map(item => `<p>“${escapeHtml(item.quote)}”</p>`).join("");
    const notice = result.decision === "answer" ? "" : '<div class="notice danger"><strong>Chuyển @Mod để xác minh.</strong>Trợ lý không tự suy đoán trong tình huống này.</div>';
    addMessage("bot", `<p>${escapeHtml(result.answer)}</p>${notice}<section class="answer"><div class="answer-top"><div class="answer-label">${result.decision === "answer" ? "Kết quả có căn cứ" : "Không tự đoán"}</div><div class="answer-text">${proof || escapeHtml(result.reason)}</div></div><div class="answer-source"><span>Mã nguồn: <code>${citations}</code></span><code>${escapeHtml(result.api_request_id || "no-api-call")}</code></div></section>`);
  } catch (error) { $("#log .system:last-of-type")?.remove(); addMessage("bot", `<div class="notice danger"><strong>Chưa thể chạy API.</strong>${escapeHtml(error.message)}</div>`); }
}
$("#composer").addEventListener("submit", event => { event.preventDefault(); ask($("#question").value); $("#question").value = ""; });
$("#clearChat").addEventListener("click", clearChat);
$("#chips").addEventListener("click", event => { const chip = event.target.closest("[data-question]"); if (chip) ask(chip.dataset.question); });
$("#dbSearch").addEventListener("input", event => renderSources(sourceCache, event.target.value));
$("#reloadSources").addEventListener("click", () => load().catch(error => addMessage("system", escapeHtml(error.message))));
$("#runTests").addEventListener("click", async () => {
  const button = $("#runTests"); button.disabled = true; button.textContent = "Đang chạy…";
  try { const report = await request("/api/run-tests", { method:"POST" }); addMessage("system", `<b>CP3 batch ${escapeHtml(report.batch_id)}</b> · đạt ${report.passed}/${report.total} · không đạt ${report.failed} · lỗi ${report.errors}`); }
  catch (error) { addMessage("system", `<b>Chưa chạy test:</b> ${escapeHtml(error.message)}`); }
  finally { button.disabled = false; button.textContent = "Chạy 20 test"; }
});
load().catch(error => { $("#apiStatus").textContent = "CP3 · không kết nối được server"; addMessage("system", escapeHtml(error.message)); });
