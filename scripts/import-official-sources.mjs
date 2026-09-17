import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { openDatabase } from "../lib/database.mjs";

const input = resolve(process.argv[2] || "data/official-sources.json");
if (!existsSync(input)) throw new Error(`Không thấy ${input}. Xem DATA_FORMAT.md để xuất nguồn thật.`);
const records = JSON.parse(readFileSync(input, "utf8"));
if (!Array.isArray(records) || !records.length) throw new Error("Tệp nguồn phải là mảng không rỗng.");
const db = openDatabase();
const insert = db.prepare(`INSERT INTO sources (id, title, body, url, published_at, audience, official)
  VALUES (?, ?, ?, ?, ?, ?, 1)
  ON CONFLICT(id) DO UPDATE SET title=excluded.title, body=excluded.body, url=excluded.url,
  published_at=excluded.published_at, audience=excluded.audience, official=1`);
let imported = 0;
for (const record of records) {
  for (const field of ["id", "title", "body", "url"]) if (typeof record[field] !== "string" || !record[field].trim()) throw new Error(`Nguồn thiếu ${field}.`);
  if (record.official !== true) throw new Error(`${record.id} không có official: true nên bị từ chối.`);
  insert.run(record.id, record.title, record.body, record.url, record.published_at || null, record.audience || "all");
  imported++;
}
db.close();
console.log(`Đã nhập ${imported} nguồn chính thức thật từ ${input}.`);
