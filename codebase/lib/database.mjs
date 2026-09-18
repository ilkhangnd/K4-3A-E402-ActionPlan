import { DatabaseSync } from "node:sqlite";
import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { sourceAppliesToProfile } from "./audience.mjs";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
export const databasePath = resolve(repositoryRoot, "data/deadline-assistant.sqlite");

export const TEST_CASES = [
  ["TC01", "Hạn nộp Lab02 [@BOT]", "escalate", "Thiếu hạn Lab02", "Câu hỏi thật: M07416"],
  ["TC02", "cho em hỏi Lab2 có được extend thời gian submit thêm không v ạ? Em lỡ nộp muộn 1 phút không submit bài được ạ", "escalate", "Ngoại lệ cá nhân", "Câu hỏi thật: M88027"],
  ["TC03", "[@BOT] nộp lab muộn trừ bao nhiêu điểm", "escalate", "Chính sách Lab chưa có nguồn", "Câu hỏi thật: M75012"],
  ["TC04", "[@BOT] tôi nộp codelab trên vlearn đúng giờ deadline như thông báo (23:59) nhưng commit trên máy bị lỗi và sau thời gian đó mới lên thì có được tính là nộp đúng hạn không ?", "escalate", "Ngoại lệ kỹ thuật cá nhân", "Không tự phê duyệt"],
  ["TC05", "[@BOT] daily standup là dành cho nhóm thôi đúng không", "answer", "Quy trình Daily", "Trả lời theo nguồn"],
  ["TC06", "[@BOT] /daily-standup có bắt buộc không? liệt kê tất cả các hoạt động bắt buộc hoặc nên làm trên discord hàng ngày", "answer", "Quy định Daily", "Trả lời phần có nguồn"],
  ["TC07", "[@BOT] daily standup , mentor duty, giải thích chi tiết", "answer", "Phân biệt hai quy trình", "Trả lời theo nguồn"],
  ["TC08", "[@BOT] demo daily stand up và mentor duty", "answer", "Hướng dẫn thao tác", "Trả lời theo nguồn"],
  ["TC09", "[@BOT] lịch thời gian nộp daily day hàng ngày", "answer", "Khung giờ Daily", "Câu hỏi thật: M50890"],
  ["TC10", "[@BOT] daily standup là sao", "answer", "Khái niệm Daily", "Trả lời theo nguồn"],
  ["TC11", "[@BOT] soạn 1 tin nhắn mẫu báo cáo daily để tôi tham khảo", "answer", "Mẫu Daily", "Trả lời theo nguồn"],
  ["TC12", "[@BOT] đối với báo cáo mentor thì sao, nếu trong 1 tuần có 2 lịch báo cáo thì sẽ gửi lệnh như nào. Cung cấp cho tôi thêm thông tin và soạn mẫu 1 tin nhắn để tôi tham khảo", "answer", "Quy trình Mentor Duty", "Câu hỏi thật: M04739"],
  ["TC13", "[@BOT] daily standup là tất cả thành viên trong nhóm nộp hay chỉ 1 thảnh viên nộp", "answer", "Người nộp Daily", "Trả lời theo nguồn"],
  ["TC14", "[@BOT] daily stand up có exp hay j khong", "answer", "XP Daily", "Trả lời theo nguồn"],
  ["TC15", "vậy yêu cầu của daily standup ngày hôm nay nộp lúc 10h là về chủ đề gì [@BOT]", "escalate", "Thiếu nội dung Daily theo ngày", "Không suy đoán"],
  ["TC16", "cú pháp của daily standup [@BOT]", "answer", "Cú pháp Daily", "Trả lời theo nguồn"],
  ["TC17", "Cú pháp của lệnh bot để thực hiện daily standup?\nCú pháp để ghi lại hoặc báo cáo daily standup?\n[@BOT]", "answer", "Nơi và cách nộp Daily", "Trả lời theo nguồn"],
  ["TC18", "[@BOT] Mình lỡ mất buổi workshop và dailystandup hôm qua thì có ảnh hưởng như thế nào", "answer", "Workshop và Daily", "Câu hỏi thật: M61254"],
  ["TC19", "[@BOT] bắt đầu hoạt động daily standup và các hoạt động có liên qua đến exp từ bao giờ?", "escalate", "Thiếu mốc hiệu lực", "Không suy đoán"],
  ["TC20", "[@BOT] dung daily stand up ntn", "answer", "Cách dùng Daily", "Trả lời theo nguồn"]
];

export function openDatabase() {
  mkdirSync(dirname(databasePath), { recursive: true });
  const db = new DatabaseSync(databasePath);
  db.exec(`
    PRAGMA foreign_keys = ON;
    PRAGMA journal_mode = WAL;
    PRAGMA busy_timeout = 5000;
    CREATE TABLE IF NOT EXISTS sources (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      body TEXT NOT NULL,
      url TEXT NOT NULL,
      published_at TEXT,
      audience TEXT NOT NULL DEFAULT 'all',
      official INTEGER NOT NULL CHECK (official IN (0, 1)),
      imported_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    ) STRICT;
    CREATE TABLE IF NOT EXISTS source_events (
      id INTEGER PRIMARY KEY,
      action TEXT NOT NULL CHECK (action IN ('created', 'updated', 'deleted')),
      source_id TEXT NOT NULL,
      title TEXT NOT NULL,
      audience TEXT NOT NULL DEFAULT 'all',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    ) STRICT;
    CREATE TABLE IF NOT EXISTS test_cases (
      id TEXT PRIMARY KEY,
      question TEXT NOT NULL,
      expected_decision TEXT NOT NULL CHECK (expected_decision IN ('answer', 'escalate')),
      scenario TEXT NOT NULL,
      note TEXT NOT NULL
    ) STRICT;
    CREATE TABLE IF NOT EXISTS test_runs (
      id INTEGER PRIMARY KEY,
      batch_id TEXT NOT NULL,
      test_case_id TEXT NOT NULL REFERENCES test_cases(id),
      decision TEXT,
      status TEXT NOT NULL CHECK (status IN ('pass', 'fail', 'error')),
      answer TEXT,
      citations_json TEXT,
      evidence_json TEXT,
      reason TEXT,
      api_request_id TEXT,
      validation_error TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    ) STRICT;
    CREATE TABLE IF NOT EXISTS discord_profiles (
      discord_user_id TEXT PRIMARY KEY,
      practice_class TEXT NOT NULL DEFAULT '',
      theory_class TEXT NOT NULL DEFAULT '',
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    ) STRICT;
    CREATE TABLE IF NOT EXISTS attendance_sessions (
      id INTEGER PRIMARY KEY,
      token TEXT NOT NULL UNIQUE,
      title TEXT NOT NULL,
      scope TEXT NOT NULL DEFAULT 'all',
      checkin_url TEXT NOT NULL,
      starts_at TEXT NOT NULL,
      ends_at TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed')),
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    ) STRICT;
    CREATE TABLE IF NOT EXISTS attendance_records (
      id INTEGER PRIMARY KEY,
      session_id INTEGER NOT NULL REFERENCES attendance_sessions(id),
      student_id TEXT NOT NULL,
      student_name TEXT NOT NULL,
      attended_at TEXT NOT NULL,
      UNIQUE(session_id, student_id)
    ) STRICT;
    CREATE TABLE IF NOT EXISTS attendance_discord_links (
      student_id TEXT PRIMARY KEY,
      discord_user_id TEXT NOT NULL UNIQUE,
      linked_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    ) STRICT;
    CREATE TABLE IF NOT EXISTS attendance_personal_tokens (
      token TEXT PRIMARY KEY,
      session_id INTEGER NOT NULL REFERENCES attendance_sessions(id),
      discord_user_id TEXT NOT NULL,
      student_id TEXT NOT NULL,
      student_name TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(session_id, discord_user_id)
    ) STRICT;
  `);
  const insert = db.prepare(`INSERT INTO test_cases
    (id, question, expected_decision, scenario, note) VALUES (?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      question = excluded.question,
      expected_decision = excluded.expected_decision,
      scenario = excluded.scenario,
      note = excluded.note
    WHERE test_cases.question IS NOT excluded.question
       OR test_cases.expected_decision IS NOT excluded.expected_decision
       OR test_cases.scenario IS NOT excluded.scenario
       OR test_cases.note IS NOT excluded.note`);
  for (const item of TEST_CASES) insert.run(...item);
  return db;
}

export function listSources(db) {
  return db.prepare(`SELECT id, title, body, url, published_at, audience FROM sources
    WHERE official = 1 ORDER BY published_at DESC, id`).all();
}

export function recordSourceEvent(db, event) {
  db.prepare(`INSERT INTO source_events (action, source_id, title, audience)
    VALUES (?, ?, ?, ?)`).run(event.action, event.source_id, event.title, event.audience || "all");
}

export function latestSourceEvent(db) {
  return db.prepare(`SELECT action, source_id, title, audience, created_at FROM source_events
    ORDER BY id DESC LIMIT 1`).get();
}

export function listTestCases(db) {
  return db.prepare(`SELECT id, question, expected_decision, scenario, note FROM test_cases ORDER BY id`).all();
}

export function getDiscordProfile(db, discordUserId) {
  return db.prepare(`SELECT practice_class, theory_class FROM discord_profiles
    WHERE discord_user_id = ?`).get(discordUserId) || { practice_class: "", theory_class: "" };
}

export function saveDiscordProfile(db, discordUserId, { practice_class = "", theory_class = "" }) {
  db.prepare(`INSERT INTO discord_profiles (discord_user_id, practice_class, theory_class, updated_at)
    VALUES (?, ?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(discord_user_id) DO UPDATE SET
      practice_class = excluded.practice_class,
      theory_class = excluded.theory_class,
      updated_at = CURRENT_TIMESTAMP`).run(discordUserId, practice_class, theory_class);
}

// MSSV is deliberately kept separate from the class profile. A student opts in
// to this mapping only when they need a QR check-in token tied to their Discord account.
export function linkAttendanceDiscord(db, { student_id, discord_user_id }) {
  const studentLink = db.prepare(`SELECT discord_user_id FROM attendance_discord_links WHERE student_id = ?`)
    .get(student_id);
  if (studentLink && studentLink.discord_user_id !== discord_user_id) return { status: "taken" };
  const discordLink = db.prepare(`SELECT student_id FROM attendance_discord_links WHERE discord_user_id = ?`)
    .get(discord_user_id);
  if (discordLink) {
    db.prepare(`UPDATE attendance_discord_links SET student_id = ?, linked_at = CURRENT_TIMESTAMP
      WHERE discord_user_id = ?`).run(student_id, discord_user_id);
    return { status: "updated" };
  }
  db.prepare(`INSERT INTO attendance_discord_links (student_id, discord_user_id, linked_at)
    VALUES (?, ?, CURRENT_TIMESTAMP)`).run(student_id, discord_user_id);
  return { status: "linked" };
}

export function findAttendanceStudentForDiscord(db, discordUserId) {
  return db.prepare(`SELECT student_id FROM attendance_discord_links WHERE discord_user_id = ?`)
    .get(discordUserId);
}

export function attendanceScopeStatus(db, session, { student_id, discord_user_id } = {}) {
  if (String(session.scope || "all").trim().toLowerCase() === "all") return { allowed: true };
  const link = discord_user_id
    ? { discord_user_id }
    : db.prepare(`SELECT discord_user_id FROM attendance_discord_links WHERE student_id = ?`).get(student_id);
  if (!link?.discord_user_id) return { allowed: false, status: "profile_required" };
  const profile = getDiscordProfile(db, link.discord_user_id);
  if (!profile.practice_class || !profile.theory_class) return { allowed: false, status: "profile_required" };
  return sourceAppliesToProfile(session.scope, profile)
    ? { allowed: true, profile }
    : { allowed: false, status: "out_of_scope", profile };
}

export function createAttendanceSession(db, session) {
  const result = db.prepare(`INSERT INTO attendance_sessions
    (token, title, scope, checkin_url, starts_at, ends_at, status)
    VALUES (?, ?, ?, ?, ?, ?, 'open')`).run(
    session.token, session.title, session.scope, session.checkin_url, session.starts_at, session.ends_at
  );
  return db.prepare(`SELECT id, token, title, scope, checkin_url, starts_at, ends_at, status, created_at
    FROM attendance_sessions WHERE id = ?`).get(result.lastInsertRowid);
}

export function listAttendanceSessions(db) {
  return db.prepare(`SELECT session.id, session.token, session.title, session.scope, session.checkin_url,
      session.starts_at, session.ends_at, session.status, session.created_at,
      COUNT(record.id) AS attendance_count
    FROM attendance_sessions AS session
    LEFT JOIN attendance_records AS record ON record.session_id = session.id
    GROUP BY session.id
    ORDER BY session.created_at DESC`).all();
}

export function listOpenAttendanceSessions(db) {
  return db.prepare(`SELECT id, token, title, scope, checkin_url, starts_at, ends_at, status
    FROM attendance_sessions
    WHERE status = 'open' AND ends_at > ?
    ORDER BY created_at DESC`).all(new Date().toISOString());
}

export function findAttendanceSession(db, token) {
  return db.prepare(`SELECT id, token, title, scope, checkin_url, starts_at, ends_at, status
    FROM attendance_sessions WHERE token = ?`).get(token);
}

export function closeAttendanceSession(db, token) {
  const result = db.prepare(`UPDATE attendance_sessions SET status = 'closed' WHERE token = ? AND status = 'open'`).run(token);
  return result.changes > 0;
}

export function findAttendanceRecord(db, sessionId, studentId) {
  return db.prepare(`SELECT attended_at FROM attendance_records WHERE session_id = ? AND student_id = ?`)
    .get(sessionId, studentId);
}

export function findLatestAttendanceForStudent(db, studentId) {
  return db.prepare(`SELECT session.title, session.scope, record.attended_at
    FROM attendance_records AS record
    JOIN attendance_sessions AS session ON session.id = record.session_id
    WHERE record.student_id = ?
    ORDER BY record.attended_at DESC
    LIMIT 1`).get(studentId);
}

export function createPersonalAttendanceToken(db, { token, session_id, discord_user_id, student_id, student_name }) {
  const prior = db.prepare(`SELECT token, session_id, discord_user_id, student_id, student_name
    FROM attendance_personal_tokens WHERE session_id = ? AND discord_user_id = ?`).get(session_id, discord_user_id);
  if (prior) return prior;
  db.prepare(`INSERT INTO attendance_personal_tokens
    (token, session_id, discord_user_id, student_id, student_name)
    VALUES (?, ?, ?, ?, ?)`).run(token, session_id, discord_user_id, student_id, student_name);
  return db.prepare(`SELECT token, session_id, discord_user_id, student_id, student_name
    FROM attendance_personal_tokens WHERE token = ?`).get(token);
}

export function findPersonalAttendanceToken(db, token) {
  return db.prepare(`SELECT personal.token, personal.discord_user_id, personal.student_id, personal.student_name,
      session.id AS session_id, session.title, session.scope, session.checkin_url, session.starts_at, session.ends_at, session.status
    FROM attendance_personal_tokens AS personal
    JOIN attendance_sessions AS session ON session.id = personal.session_id
    WHERE personal.token = ?`).get(token);
}

function recordAttendanceForSession(db, session, { student_id, student_name, discord_user_id }) {
  const now = new Date();
  if (session.status !== "open" || Date.parse(session.ends_at) <= now.getTime()) return { status: "closed", session };
  const scope = attendanceScopeStatus(db, session, { student_id, discord_user_id });
  if (!scope.allowed) return { status: scope.status, session, profile: scope.profile };
  const attendedAt = now.toISOString();
  try {
    db.prepare(`INSERT INTO attendance_records (session_id, student_id, student_name, attended_at)
      VALUES (?, ?, ?, ?)`).run(session.id, student_id, student_name, attendedAt);
    return { status: "recorded", session, attended_at: attendedAt };
  } catch (error) {
    if (/UNIQUE constraint failed/.test(error.message)) return { status: "duplicate", session };
    throw error;
  }
}

export function recordAttendance(db, token, { student_id, student_name }) {
  const session = findAttendanceSession(db, token);
  if (!session) return { status: "not_found" };
  return recordAttendanceForSession(db, session, { student_id, student_name });
}

export function recordPersonalAttendance(db, token) {
  const personal = findPersonalAttendanceToken(db, token);
  if (!personal) return { status: "not_found" };
  return recordAttendanceForSession(db, { ...personal, id: personal.session_id }, personal);
}
