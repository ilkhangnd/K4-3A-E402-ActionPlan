import { readFileSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { openDatabase } from "../lib/database.mjs";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const input = resolve(repositoryRoot, "data/discord-pack/k4_messages.csv");
if (!existsSync(input)) throw new Error("Không thấy data/discord-pack/k4_messages.csv.");

function parseCsv(text) {
  const rows = []; let row = []; let field = ""; let quoted = false;
  for (let index = 0; index < text.length; index++) {
    const char = text[index]; const next = text[index + 1];
    if (quoted && char === '"' && next === '"') { field += '"'; index++; continue; }
    if (char === '"') { quoted = !quoted; continue; }
    if (!quoted && char === ",") { row.push(field); field = ""; continue; }
    if (!quoted && (char === "\n" || char === "\r")) {
      if (char === "\r" && next === "\n") index++;
      row.push(field); field = ""; if (row.length > 1) rows.push(row); row = []; continue;
    }
    field += char;
  }
  if (field || row.length) { row.push(field); rows.push(row); }
  const [header, ...body] = rows;
  return body.map(values => Object.fromEntries(header.map((name, index) => [name, values[index] || ""])));
}

const golden = [
  ["TC01", "M07416", "escalate", "Tra cứu hạn Lab02 chưa có mốc trong nguồn"],
  ["TC02", "M88027", "escalate", "Xin gia hạn nộp Lab2"],
  ["TC03", "M75012", "escalate", "Chính sách nộp Lab muộn chưa có nguồn trực tiếp"],
  ["TC04", "M40677", "escalate", "Ngoại lệ lỗi commit sau deadline"],
  ["TC05", "M30120", "answer", "Daily standup dành cho team hay cá nhân"],
  ["TC06", "M89326", "answer", "Daily standup có bắt buộc không"],
  ["TC07", "M12561", "answer", "Giải thích daily standup và mentor duty"],
  ["TC08", "M15979", "answer", "Demo daily standup và mentor duty"],
  ["TC09", "M50890", "answer", "Khung giờ nộp daily hằng ngày"],
  ["TC10", "M23792", "answer", "Daily standup là gì"],
  ["TC11", "M16850", "answer", "Xin mẫu báo cáo daily"],
  ["TC12", "M04739", "answer", "Quy trình báo cáo mentor duty"],
  ["TC13", "M77407", "answer", "Cả nhóm hay từng người nộp daily"],
  ["TC14", "M68577", "answer", "Daily standup có XP không"],
  ["TC15", "M94107", "escalate", "Nội dung Daily theo ngày chưa có nguồn"],
  ["TC16", "M80674", "answer", "Cú pháp Daily Standup"],
  ["TC17", "M84422", "answer", "Nộp Daily Standup ở đâu"],
  ["TC18", "M61254", "answer", "Ảnh hưởng khi lỡ workshop và daily"],
  ["TC19", "M89758", "escalate", "Thời điểm bắt đầu Daily chưa có nguồn"],
  ["TC20", "M77226", "answer", "Cách dùng daily standup"]
];

const records = new Map(parseCsv(readFileSync(input, "utf8")).map(record => [record.msg_id, record]));
const db = openDatabase();
const update = db.prepare(`UPDATE test_cases SET question = ?, expected_decision = ?, scenario = ?, note = ? WHERE id = ?`);
for (const [caseId, messageId, expected, scenario] of golden) {
  const record = records.get(messageId);
  if (!record || record.is_bot !== "False") throw new Error(`Không tìm thấy câu hỏi người dùng ${messageId}.`);
  update.run(record.content, expected, scenario, `Câu hỏi thật từ discord-pack · ${messageId}` , caseId);
}
db.close();
console.log(`Đã nạp ${golden.length} câu hỏi thật vào golden set cục bộ; không đưa nội dung pack vào Git.`);
