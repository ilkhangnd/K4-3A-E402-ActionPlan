import { createServer } from "node:http";
import { readFileSync, existsSync, statSync } from "node:fs";
import { dirname, extname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { openDatabase, listSources, listTestCases } from "./lib/database.mjs";
import { answerQuestion, keyStatus, runAllTests } from "./lib/assistant.mjs";

const db = openDatabase();
const port = Number(process.env.PORT || 3000);
const codebaseRoot = dirname(fileURLToPath(import.meta.url));
const publicDir = resolve(codebaseRoot, "public");
const discordPackDir = resolve(codebaseRoot, "../data/discord-pack");
const contentTypes = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8", ".png": "image/png", ".webp": "image/webp" };

function send(response, status, payload) {
  response.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  response.end(JSON.stringify(payload));
}
function body(request) {
  return new Promise((resolveBody, reject) => {
    let raw = "";
    request.on("data", chunk => { raw += chunk; if (raw.length > 100_000) request.destroy(); });
    request.on("end", () => { try { resolveBody(raw ? JSON.parse(raw) : {}); } catch { reject(new Error("JSON không hợp lệ.")); } });
    request.on("error", reject);
  });
}

const server = createServer(async (request, response) => {
  try {
    const url = new URL(request.url, `http://${request.headers.host}`);
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
    if (request.method === "POST" && url.pathname === "/api/sources") {
      const input = await body(request);
      const fields = ["id", "title", "body", "url"];
      if (fields.some(field => typeof input[field] !== "string" || !input[field].trim())) return send(response, 400, { error: "Cần đủ mã nguồn, tiêu đề, nội dung và link nguồn." });
      let sourceUrl;
      try { sourceUrl = new URL(input.url); } catch { return send(response, 400, { error: "Link nguồn không hợp lệ." }); }
      if (sourceUrl.protocol !== "https:") return send(response, 400, { error: "Nguồn phải dùng link HTTPS." });
      db.prepare(`INSERT INTO sources (id, title, body, url, published_at, audience, official)
        VALUES (?, ?, ?, ?, ?, ?, 1)
        ON CONFLICT(id) DO UPDATE SET title=excluded.title, body=excluded.body, url=excluded.url,
        published_at=excluded.published_at, audience=excluded.audience, official=1`).run(
        input.id.trim(), input.title.trim(), input.body.trim(), sourceUrl.toString(),
        typeof input.published_at === "string" ? input.published_at.trim() || null : null,
        typeof input.audience === "string" ? input.audience.trim() || "all" : "all"
      );
      return send(response, 201, { ok: true });
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
server.listen(port, "127.0.0.1", () => console.log(`CP3 working app: http://localhost:${port}`));
process.on("SIGINT", () => { db.close(); server.close(); });
