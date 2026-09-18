import { createServer } from "node:http";
import { readFileSync, existsSync, statSync } from "node:fs";
import { dirname, extname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { randomBytes } from "node:crypto";
import QRCode from "qrcode";
import { closeAttendanceSession, createAttendanceSession, findAttendanceSession, findPersonalAttendanceToken, listAttendanceSessions, openDatabase, listSources, listTestCases, recordAttendance, recordPersonalAttendance, recordSourceEvent } from "./lib/database.mjs";
import { answerQuestion, keyStatus, runAllTests } from "./lib/assistant.mjs";
import { canonicalAudience } from "./lib/audience.mjs";
import { normalizeSourceImport } from "./lib/source-import.mjs";

const db = openDatabase();
const port = Number(process.env.PORT || 3000);
const publicAttendanceOnly = process.env.PUBLIC_ATTENDANCE_ONLY === "true";
const codebaseRoot = dirname(fileURLToPath(import.meta.url));
const publicDir = resolve(codebaseRoot, "public");
const discordPackDir = resolve(codebaseRoot, "../data/discord-pack");
const contentTypes = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8", ".png": "image/png", ".webp": "image/webp" };
const saveOfficialSource = db.prepare(`INSERT INTO sources (id, title, body, url, published_at, audience, official)
  VALUES (?, ?, ?, ?, ?, ?, 1)
  ON CONFLICT(id) DO UPDATE SET title=excluded.title, body=excluded.body, url=excluded.url,
  published_at=excluded.published_at, audience=excluded.audience, official=1`);

function send(response, status, payload) {
  response.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  response.end(JSON.stringify(payload));
}
function sendPage(response, status, html) {
  response.writeHead(status, { "Content-Type": "text/html; charset=utf-8" });
  response.end(html);
}
function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[character]));
}
function formatTime(iso) {
  return new Intl.DateTimeFormat("vi-VN", { dateStyle: "medium", timeStyle: "medium", timeZone: "Asia/Ho_Chi_Minh" }).format(new Date(iso));
}
function isAttendanceAdmin(request) {
  const expected = process.env.ADMIN_ATTENDANCE_KEY;
  if (expected) return request.headers["x-admin-attendance-key"] === expected;
  return ["127.0.0.1", "::1", "::ffff:127.0.0.1"].includes(request.socket.remoteAddress);
}
function attendanceAdminError(response) {
  const error = process.env.ADMIN_ATTENDANCE_KEY
    ? "Mã quản trị điểm danh không đúng."
    : "Dashboard điểm danh chỉ mở được từ localhost. Nếu cần quản trị qua mạng/tunnel, hãy cấu hình ADMIN_ATTENDANCE_KEY trong .env local.";
  return send(response, 403, { error });
}
function attendanceScopeError(response, result) {
  if (result.status === "profile_required") {
    return send(response, 403, { error: `Phiên này chỉ áp dụng cho **${result.session.scope}**. Hãy dùng /thiet-lap và /lien-ket-mssv trên Discord trước để hệ thống kiểm tra lớp của bạn.` });
  }
  return send(response, 403, { error: `Phiên này chỉ áp dụng cho **${result.session.scope}**; hồ sơ lớp của bạn không thuộc phạm vi này nên điểm danh không được ghi nhận.` });
}
function isPublicAttendanceRequest(request, pathname) {
  if (!["GET", "POST"].includes(request.method)) return false;
  return /^\/attendance\/(?:personal\/)?[A-Za-z0-9_-]+$/.test(pathname)
    || /^\/api\/attendance\/(?:personal\/)?[A-Za-z0-9_-]+(?:\/check-in)?$/.test(pathname);
}
async function sessionWithQr(session) {
  return { ...session, qr_data_url: await QRCode.toDataURL(session.checkin_url, { width: 280, margin: 2, errorCorrectionLevel: "M" }) };
}
function attendancePage(token) {
  return `<!doctype html><html lang="vi"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Điểm danh AI20K</title><style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:#f5f7fb;color:#172b4d;font:16px Inter,system-ui,sans-serif}.card{width:min(480px,calc(100% - 32px));padding:28px;border:1px solid #e1e7f0;border-radius:22px;background:#fff;box-shadow:0 18px 50px #152b5115}h1{margin:0 0 8px;font-size:27px}p{color:#637490;line-height:1.5}.meta{padding:12px;border-radius:10px;background:#f4f7fb;color:#435572}.form{display:grid;gap:12px;margin-top:20px}label{display:grid;gap:6px;font-weight:700}input{padding:12px;border:1px solid #cbd6e5;border-radius:10px;font:inherit}button{border:0;border-radius:10px;padding:13px;background:#a31330;color:#fff;font:750 16px inherit;cursor:pointer}button:disabled{opacity:.6}.result{display:none;margin-top:18px;padding:14px;border-radius:12px;line-height:1.5}.success{background:#eaf7f2;color:#126b58}.error{background:#fff0f2;color:#9b1830}</style><main class="card"><h1 id="title">Đang kiểm tra phiên điểm danh…</h1><p id="subtitle">Vui lòng đợi một chút.</p><div class="meta" id="meta"></div><form class="form" id="form" hidden><label>Họ và tên<input name="student_name" required maxlength="80" autocomplete="name"></label><label>MSSV<input name="student_id" required maxlength="30" autocomplete="off"></label><button type="submit">Xác nhận điểm danh</button></form><div class="result" id="result"></div></main><script>const token=${JSON.stringify(token)};const result=document.querySelector('#result');const show=(text,type)=>{result.textContent=text;result.className='result '+type;result.style.display='block'};async function request(path,options){const r=await fetch(path,options);const j=await r.json();if(!r.ok)throw new Error(j.error||'Không thể xử lý yêu cầu.');return j}async function load(){try{const s=await request('/api/attendance/'+token);document.querySelector('#title').textContent=s.title;document.querySelector('#subtitle').textContent='Bạn đang điểm danh cho phiên này.';document.querySelector('#meta').textContent='Phạm vi: '+s.scope+' · Kết thúc lúc: '+s.ends_at_display;document.querySelector('#form').hidden=false}catch(e){document.querySelector('#title').textContent='Phiên điểm danh không khả dụng';document.querySelector('#subtitle').textContent=e.message}}document.querySelector('#form').addEventListener('submit',async e=>{e.preventDefault();const button=e.currentTarget.querySelector('button');button.disabled=true;try{const data=Object.fromEntries(new FormData(e.currentTarget));const r=await request('/api/attendance/'+token+'/check-in',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});e.currentTarget.hidden=true;show('Đã điểm danh thành công lúc '+r.attended_at_display+'. Bạn có thể đóng trang này.','success')}catch(error){show(error.message,'error');button.disabled=false}});load();</script></html>`;
}
function personalAttendancePage(token) {
  return `<!doctype html><html lang="vi"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Xác nhận điểm danh</title><style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:#f5f7fb;color:#172b4d;font:16px Inter,system-ui,sans-serif}.card{width:min(480px,calc(100% - 32px));padding:28px;border:1px solid #e1e7f0;border-radius:22px;background:#fff;box-shadow:0 18px 50px #152b5115}h1{margin:0 0 8px;font-size:27px}p{color:#637490;line-height:1.5}.meta{padding:12px;border-radius:10px;background:#f4f7fb;color:#435572}button{width:100%;margin-top:20px;border:0;border-radius:10px;padding:13px;background:#a31330;color:#fff;font:750 16px inherit;cursor:pointer}button:disabled{opacity:.6}.result{display:none;margin-top:18px;padding:14px;border-radius:12px;line-height:1.5}.success{background:#eaf7f2;color:#126b58}.error{background:#fff0f2;color:#9b1830}</style><main class="card"><h1 id="title">Đang kiểm tra QR…</h1><p id="subtitle">QR này chỉ dùng cho tài khoản Discord đã yêu cầu.</p><div class="meta" id="meta"></div><button id="checkin" hidden>Xác nhận điểm danh</button><div class="result" id="result"></div></main><script>const token=${JSON.stringify(token)},result=document.querySelector('#result'),button=document.querySelector('#checkin');const show=(text,type)=>{result.textContent=text;result.className='result '+type;result.style.display='block'};async function request(path,options){const r=await fetch(path,options);const j=await r.json();if(!r.ok)throw new Error(j.error||'Không thể xử lý yêu cầu.');return j}async function load(){try{const s=await request('/api/attendance/personal/'+token);document.querySelector('#title').textContent=s.title;document.querySelector('#meta').textContent='Phạm vi: '+s.scope+' · Kết thúc lúc: '+s.ends_at_display;button.hidden=false}catch(e){document.querySelector('#title').textContent='QR không khả dụng';document.querySelector('#subtitle').textContent=e.message}}button.addEventListener('click',async()=>{button.disabled=true;try{const r=await request('/api/attendance/personal/'+token+'/check-in',{method:'POST'});button.hidden=true;show('Đã điểm danh thành công lúc '+r.attended_at_display+'. Bản ghi đã được lưu trong hệ thống điểm danh.','success')}catch(e){show(e.message,'error');button.disabled=false}});load();</script></html>`;
}
function body(request) {
  return new Promise((resolveBody, reject) => {
    let raw = "";
    request.on("data", chunk => { raw += chunk; if (raw.length > 100_000) request.destroy(); });
    request.on("end", () => { try { resolveBody(raw ? JSON.parse(raw) : {}); } catch { reject(new Error("JSON không hợp lệ.")); } });
    request.on("error", reject);
  });
}
function prepareSource(input, { requireOfficial = false } = {}) {
  const fields = ["id", "title", "body", "url"];
  if (!input || fields.some(field => typeof input[field] !== "string" || !input[field].trim())) {
    throw new Error("Cần đủ mã nguồn, tiêu đề, nội dung và link nguồn.");
  }
  if (requireOfficial && input.official !== true) throw new Error(`${input.id} không có official: true nên bị từ chối.`);
  let sourceUrl;
  try { sourceUrl = new URL(input.url); } catch { throw new Error("Link nguồn không hợp lệ."); }
  if (!["https:", "local:"].includes(sourceUrl.protocol)) throw new Error("Nguồn phải dùng link HTTPS hoặc local:// đã được nhóm xác thực.");
  let audience;
  try { audience = canonicalAudience(typeof input.audience === "string" ? input.audience : "all"); } catch (error) { throw error; }
  return {
    id: input.id.trim(), title: input.title.trim(), body: input.body.trim(), url: sourceUrl.toString(),
    published_at: typeof input.published_at === "string" ? input.published_at.trim() || null : null,
    audience
  };
}
function saveSource(source) {
  const prior = db.prepare("SELECT id FROM sources WHERE id = ?").get(source.id);
  saveOfficialSource.run(source.id, source.title, source.body, source.url, source.published_at, source.audience);
  const event = { action: prior ? "updated" : "created", source_id: source.id, title: source.title, audience: source.audience };
  recordSourceEvent(db, event);
  return event.action;
}

const server = createServer(async (request, response) => {
  try {
    const url = new URL(request.url, `http://${request.headers.host}`);
    // The tunnel process uses this restricted listener on port 3001.  It must
    // never expose admin/source/OpenAI endpoints to the public Internet.
    if (publicAttendanceOnly && !isPublicAttendanceRequest(request, url.pathname)) {
      return send(response, 404, { error: "Không tìm thấy." });
    }
    if (request.method === "GET" && url.pathname === "/api/health") {
      return send(response, 200, { api_key_configured: keyStatus(), official_sources: listSources(db).length, test_cases: listTestCases(db).length, model: process.env.OPENAI_MODEL || "gpt-5" });
    }
    if (request.method === "GET" && url.pathname === "/api/test-cases") return send(response, 200, listTestCases(db));
    if (request.method === "GET" && url.pathname === "/api/sources") return send(response, 200, listSources(db).map(({ body, ...source }) => ({ ...source, content: body })));
    if (request.method === "GET" && url.pathname === "/api/data-pack") {
      const files = [
        ["k4_messages.csv", "1.092 tin nhắn đã ẩn danh · dùng làm câu hỏi golden set"],
        ["k4_daily_reports.md", "4 bản tin ngày của bot · dùng để phân tích baseline"],
        ["DATA_DICTIONARY.md", "Mô tả cấu trúc và giới hạn của dữ liệu"]
      ].filter(([file]) => existsSync(resolve(discordPackDir, file))).map(([file, description]) => ({ file, description, bytes: statSync(resolve(discordPackDir, file)).size }));
      const golden = db.prepare("SELECT count(*) AS count FROM test_cases WHERE note LIKE '%discord-pack%'").get().count;
      return send(response, 200, { available: files.length > 0, files, golden_cases: golden });
    }
    const personalAttendanceMatch = url.pathname.match(/^\/api\/attendance\/personal\/([A-Za-z0-9_-]+)$/);
    if (request.method === "GET" && personalAttendanceMatch) {
      const personal = findPersonalAttendanceToken(db, personalAttendanceMatch[1]);
      if (!personal) return send(response, 404, { error: "Không tìm thấy QR cá nhân này." });
      if (personal.status !== "open" || Date.parse(personal.ends_at) <= Date.now()) return send(response, 410, { error: "QR điểm danh đã hết hạn hoặc đã được đóng." });
      return send(response, 200, { title: personal.title, scope: personal.scope, ends_at_display: formatTime(personal.ends_at) });
    }
    const personalCheckinMatch = url.pathname.match(/^\/api\/attendance\/personal\/([A-Za-z0-9_-]+)\/check-in$/);
    if (request.method === "POST" && personalCheckinMatch) {
      const personal = findPersonalAttendanceToken(db, personalCheckinMatch[1]);
      if (!personal) return send(response, 404, { error: "Không tìm thấy QR cá nhân này." });
      const result = recordPersonalAttendance(db, personalCheckinMatch[1]);
      if (result.status === "closed") return send(response, 410, { error: "QR điểm danh đã hết hạn hoặc đã được đóng." });
      if (["profile_required", "out_of_scope"].includes(result.status)) return attendanceScopeError(response, result);
      if (result.status === "duplicate") return send(response, 409, { error: "Bạn đã điểm danh phiên này rồi." });
      return send(response, 201, { ok: true, attended_at_display: formatTime(result.attended_at) });
    }
    if (request.method === "GET" && url.pathname === "/api/attendance/sessions") {
      if (!isAttendanceAdmin(request)) return attendanceAdminError(response);
      const sessions = await Promise.all(listAttendanceSessions(db).map(sessionWithQr));
      return send(response, 200, sessions);
    }
    if (request.method === "POST" && url.pathname === "/api/attendance/sessions") {
      if (!isAttendanceAdmin(request)) return attendanceAdminError(response);
      const input = await body(request);
      const title = typeof input.title === "string" ? input.title.trim() : "";
      let scope;
      try { scope = canonicalAudience(typeof input.scope === "string" && input.scope.trim() ? input.scope : "all"); }
      catch (error) { return send(response, 400, { error: error.message }); }
      const duration = Number(input.duration_minutes);
      if (!title || title.length > 120) return send(response, 400, { error: "Cần tên buổi điểm danh (tối đa 120 ký tự)." });
      if (!Number.isInteger(duration) || duration < 1 || duration > 180) return send(response, 400, { error: "Thời lượng QR phải từ 1 đến 180 phút." });
      let publicUrl;
      try { publicUrl = new URL(input.public_url); } catch { return send(response, 400, { error: "Link quét QR không hợp lệ." }); }
      if (!["http:", "https:"].includes(publicUrl.protocol)) return send(response, 400, { error: "Link quét QR phải dùng HTTP hoặc HTTPS." });
      const token = randomBytes(18).toString("base64url");
      const startsAt = new Date().toISOString();
      const endsAt = new Date(Date.now() + duration * 60_000).toISOString();
      const session = createAttendanceSession(db, {
        token, title, scope: scope.slice(0, 80),
        checkin_url: new URL(`/attendance/${token}`, publicUrl.origin).toString(),
        starts_at: startsAt, ends_at: endsAt
      });
      return send(response, 201, await sessionWithQr({ ...session, attendance_count: 0 }));
    }
    const closeAttendanceMatch = url.pathname.match(/^\/api\/attendance\/([A-Za-z0-9_-]+)\/close$/);
    if (request.method === "POST" && closeAttendanceMatch) {
      if (!isAttendanceAdmin(request)) return attendanceAdminError(response);
      const closed = closeAttendanceSession(db, closeAttendanceMatch[1]);
      if (!closed) return send(response, 409, { error: "Phiên đã đóng hoặc không tồn tại." });
      return send(response, 200, { ok: true });
    }
    const attendanceMatch = url.pathname.match(/^\/api\/attendance\/([A-Za-z0-9_-]+)$/);
    if (request.method === "GET" && attendanceMatch) {
      const session = findAttendanceSession(db, attendanceMatch[1]);
      if (!session) return send(response, 404, { error: "Không tìm thấy phiên điểm danh." });
      if (session.status !== "open" || Date.parse(session.ends_at) <= Date.now()) return send(response, 410, { error: "QR điểm danh đã hết hạn hoặc đã được đóng." });
      return send(response, 200, { title: session.title, scope: session.scope, ends_at_display: formatTime(session.ends_at) });
    }
    const checkinMatch = url.pathname.match(/^\/api\/attendance\/([A-Za-z0-9_-]+)\/check-in$/);
    if (request.method === "POST" && checkinMatch) {
      const input = await body(request);
      const studentId = typeof input.student_id === "string" ? input.student_id.trim().toUpperCase().replace(/\s+/g, "") : "";
      const studentName = typeof input.student_name === "string" ? input.student_name.trim() : "";
      if (!studentId || studentId.length > 30 || !studentName || studentName.length > 80) return send(response, 400, { error: "Hãy nhập họ tên và MSSV hợp lệ." });
      const result = recordAttendance(db, checkinMatch[1], { student_id: studentId, student_name: studentName });
      if (result.status === "not_found") return send(response, 404, { error: "Không tìm thấy phiên điểm danh." });
      if (result.status === "closed") return send(response, 410, { error: "QR điểm danh đã hết hạn hoặc đã được đóng." });
      if (["profile_required", "out_of_scope"].includes(result.status)) return attendanceScopeError(response, result);
      if (result.status === "duplicate") return send(response, 409, { error: "MSSV này đã điểm danh trong phiên này rồi." });
      return send(response, 201, { ok: true, attended_at_display: formatTime(result.attended_at) });
    }
    if (request.method === "POST" && url.pathname === "/api/sources/import") {
      const input = await body(request);
      let sources;
      try {
        sources = normalizeSourceImport(input).map(record => prepareSource(record, { requireOfficial: true }));
      } catch (error) {
        return send(response, 400, { error: error.message });
      }
      const actions = sources.map(saveSource);
      return send(response, 201, { ok: true, imported: actions.length, created: actions.filter(action => action === "created").length, updated: actions.filter(action => action === "updated").length });
    }
    if (request.method === "POST" && url.pathname === "/api/sources") {
      const input = await body(request);
      try {
        const action = saveSource(prepareSource(input));
        return send(response, 201, { ok: true, action });
      } catch (error) {
        return send(response, 400, { error: error.message });
      }
    }
    if (request.method === "DELETE" && url.pathname.startsWith("/api/sources/")) {
      const sourceId = decodeURIComponent(url.pathname.slice("/api/sources/".length)).trim();
      if (!sourceId || sourceId.length > 160) return send(response, 400, { error: "Mã nguồn không hợp lệ." });
      const prior = db.prepare("SELECT title, audience FROM sources WHERE id = ?").get(sourceId);
      const result = db.prepare("DELETE FROM sources WHERE id = ?").run(sourceId);
      if (!result.changes) return send(response, 404, { error: "Không tìm thấy nguồn để xoá." });
      const event = { action: "deleted", source_id: sourceId, title: prior.title, audience: prior.audience };
      recordSourceEvent(db, event);
      return send(response, 200, { ok: true, id: sourceId });
    }
    if (request.method === "POST" && url.pathname === "/api/ask") {
      const input = await body(request);
      if (typeof input.question !== "string" || !input.question.trim()) return send(response, 400, { error: "Cần question." });
      const profile = input.profile && typeof input.profile === "object" ? {
        practice_class: typeof input.profile.practice_class === "string" ? input.profile.practice_class.slice(0, 80) : "",
        theory_class: typeof input.profile.theory_class === "string" ? input.profile.theory_class.slice(0, 80) : ""
      } : {};
      return send(response, 200, await answerQuestion(db, input.question.trim(), profile));
    }
    if (request.method === "POST" && url.pathname === "/api/run-tests") return send(response, 200, await runAllTests(db));
    const personalAttendancePageMatch = url.pathname.match(/^\/attendance\/personal\/([A-Za-z0-9_-]+)$/);
    if (request.method === "GET" && personalAttendancePageMatch) return sendPage(response, 200, personalAttendancePage(personalAttendancePageMatch[1]));
    const attendancePageMatch = url.pathname.match(/^\/attendance\/([A-Za-z0-9_-]+)$/);
    if (request.method === "GET" && attendancePageMatch) return sendPage(response, 200, attendancePage(attendancePageMatch[1]));
    if (request.method === "GET") {
      const relative = url.pathname === "/" ? "/index.html" : url.pathname;
      const file = resolve(publicDir, `.${relative}`);
      if (!file.startsWith(`${publicDir}/`) || !existsSync(file)) return send(response, 404, { error: "Không tìm thấy." });
      response.writeHead(200, { "Content-Type": contentTypes[extname(file)] || "application/octet-stream" });
      return response.end(readFileSync(file));
    }
    return send(response, 405, { error: "Method không được hỗ trợ." });
  } catch (error) {
    const status = /OPENAI_API_KEY|nguồn chính thức/.test(error.message) ? 503 : 500;
    return send(response, status, { error: error.message });
  }
});
const host = process.env.HOST || "0.0.0.0";
server.listen(port, host, () => console.log(`CP3 working app: http://localhost:${port}`));
process.on("SIGINT", () => { db.close(); server.close(); });
