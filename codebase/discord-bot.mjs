import { AttachmentBuilder, Client, Events, GatewayIntentBits, PermissionFlagsBits } from "discord.js";
import { randomBytes } from "node:crypto";
import QRCode from "qrcode";
import { answerQuestion, keyStatus } from "./lib/assistant.mjs";
import { canonicalAudience } from "./lib/audience.mjs";
import { attendanceScopeStatus, createAttendanceSession, createPersonalAttendanceToken, findAttendanceRecord, findAttendanceStudentForDiscord, findLatestAttendanceForStudent, getDiscordProfile, latestSourceEvent, linkAttendanceDiscord, listOpenAttendanceSessions, listSources, openDatabase, saveDiscordProfile } from "./lib/database.mjs";

const token = process.env.DISCORD_BOT_TOKEN;
if (!token) throw new Error("Thiếu DISCORD_BOT_TOKEN. Xem discord-setup.md; không commit token.");
if (!keyStatus()) throw new Error("Thiếu OPENAI_API_KEY. Bot không được chạy với câu trả lời mock.");

const db = openDatabase();
const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
});
const classPattern = /^[0-9]+[A-Z](?:-[A-Z][0-9]{3})?$/;
const normaliseClass = value => value.trim().toUpperCase().replace(/\s+/g, "");
const normaliseStudentId = value => value.trim().toUpperCase().replace(/\s+/g, "");
const pendingAttendanceConfirmations = new Map();

function attendanceAdmin(interaction) {
  return interaction.inGuild() && interaction.memberPermissions?.has(PermissionFlagsBits.ManageGuild);
}

function publicAttendanceUrl(baseUrl, token) {
  const root = new URL(baseUrl);
  if (!["http:", "https:"].includes(root.protocol)) throw new Error("Link QR phải dùng HTTP hoặc HTTPS.");
  if (["localhost", "127.0.0.1", "::1"].includes(root.hostname)) {
    throw new Error("Link QR không thể là localhost vì điện thoại không mở được. Dùng URL public/tunnel hoặc IP LAN của máy chạy bot.");
  }
  return new URL(`/attendance/${token}`, root.origin).toString();
}

function personalAttendanceUrl(session, personalToken) {
  return new URL(`/attendance/personal/${personalToken}`, session.checkin_url).toString();
}

function formatAttendanceTime(iso) {
  return new Intl.DateTimeFormat("vi-VN", { dateStyle: "medium", timeStyle: "medium", timeZone: "Asia/Ho_Chi_Minh" }).format(new Date(iso));
}

async function sendPendingAttendanceConfirmations() {
  for (const [key, pending] of pendingAttendanceConfirmations) {
    const record = findAttendanceRecord(db, pending.sessionId, pending.studentId);
    if (!record) continue;
    try {
      await pending.interaction.followUp({
        ephemeral: true,
        content: `✅ **${pending.studentName}** đã điểm danh **${pending.sessionTitle}** lúc **${formatAttendanceTime(record.attended_at)}**.`
      });
    } catch (error) {
      console.error("Không thể gửi xác nhận điểm danh:", error.message);
    } finally {
      pendingAttendanceConfirmations.delete(key);
    }
  }
}

setInterval(() => { void sendPendingAttendanceConfirmations(); }, 1_500).unref();

function shortSourceList() {
  const sources = listSources(db);
  const rows = sources.slice(0, 18).map(source => `• **${source.title}** — phạm vi: ${source.audience || "all"}`);
  if (sources.length > rows.length) rows.push(`• … và ${sources.length - rows.length} nguồn khác`);
  return rows.join("\n");
}

function readableAnswer(answer) {
  const withHeadings = answer.trim()
    .replace(/^Thông tin chính:\s*/im, "**Thông tin chính**\n")
    .replace(/^Bạn cần làm gì:\s*/im, "**Bạn cần làm gì**\n")
    .replace(/\n{3,}/g, "\n\n");
  return withHeadings.split("\n").map(line => {
    const parts = line.split(/;\s*/).map(part => part.trim()).filter(Boolean);
    return line.length > 240 && parts.length >= 3
      ? parts.map(part => `- ${part}`).join("\n")
      : line;
  }).join("\n");
}

function formatAnswer(result) {
  const safeAnswer = readableAnswer(result.answer).slice(0, 1_600);
  const notice = result.decision === "escalate"
    ? "\n\n⚠️ Mình chưa tự quyết định trường hợp này. Bạn hãy gửi @Mod tên bài và thời điểm thao tác để được xác minh."
    : "";
  const byId = new Map(listSources(db).map(source => [source.id, source]));
  const references = result.decision === "answer"
    ? result.citations.map(id => byId.get(id)).filter(Boolean)
      .map(source => source.url.startsWith("https://")
        ? `• [${source.title}](${source.url})`
        : `• **${source.title}** — nguồn admin đã xác thực cục bộ`).join("\n")
    : "";
  const sourceNote = references ? `\n\n**Tham khảo thêm tại:**\n${references}` : "";
  return `${safeAnswer}${notice}${sourceNote}`.slice(0, 1_900);
}

function questionAfterMention(message) {
  const botId = client.user?.id;
  if (!botId) return "";
  return message.content
    .replace(new RegExp(`<@!?${botId}>`, "g"), "")
    .trim();
}

client.once(Events.ClientReady, readyClient => {
  console.log(`Trợ lý Thực Chiến đã đăng nhập Discord với ${readyClient.user.tag}.`);
});

client.on(Events.Error, error => {
  console.error("Discord client error:", error.message);
});

client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isChatInputCommand()) return;
  if (!interaction.inGuild()) {
    return interaction.reply({ ephemeral: true, content: "Hãy dùng Trợ lý trong kênh của server để giữ toàn bộ trao đổi ở cùng một nơi nhé." });
  }

  try {
    if (interaction.commandName === "thiet-lap") {
      const practiceClass = normaliseClass(interaction.options.getString("lop_thuc_hanh", true));
      const theoryClass = normaliseClass(interaction.options.getString("lop_ly_thuyet", true));
      if (!classPattern.test(practiceClass) || !classPattern.test(theoryClass)) {
        return interaction.reply({ ephemeral: true, content: "Lớp cần theo format `3A-E402`, `3A-D301` hoặc `3B`. Bạn thử lại nhé." });
      }
      saveDiscordProfile(db, interaction.user.id, { practice_class: practiceClass, theory_class: theoryClass });
      return interaction.reply({ ephemeral: true, content: `Đã lưu lớp thực hành **${practiceClass}** và lớp lý thuyết **${theoryClass}**. Mình chỉ dùng hai lớp này để lọc nguồn phù hợp; không lưu MSSV.` });
    }

    if (interaction.commandName === "nguon") {
      const count = listSources(db).length;
      const latest = latestSourceEvent(db);
      const latestText = latest ? `\n\nCập nhật gần nhất: **${latest.title}** (${latest.action === "deleted" ? "đã gỡ" : latest.action === "updated" ? "đã cập nhật" : "đã thêm"}).` : "";
      return interaction.reply({ ephemeral: true, content: `Mình đang đọc trực tiếp **${count} nguồn chính thức** từ database website:\n${shortSourceList() || "Chưa có nguồn."}${latestText}\n\nNguồn mới phải được người trong nhóm xác thực trước khi bot dùng để trả lời.` });
    }

    if (interaction.commandName === "lien-ket-mssv") {
      const studentId = normaliseStudentId(interaction.options.getString("mssv", true));
      if (!/^[A-Z0-9-]{4,30}$/.test(studentId)) {
        return interaction.reply({ ephemeral: true, content: "MSSV chỉ gồm chữ, số hoặc dấu gạch ngang (4–30 ký tự). Bạn thử lại nhé." });
      }
      const linked = linkAttendanceDiscord(db, { student_id: studentId, discord_user_id: interaction.user.id });
      if (linked.status === "taken") {
        return interaction.reply({ ephemeral: true, content: "MSSV này đã được liên kết với một tài khoản Discord khác nên không thể ghi đè. Nếu đây là nhầm lẫn, hãy liên hệ admin để xác minh." });
      }
      return interaction.reply({
        ephemeral: true,
        content: `${linked.status === "updated" ? "Đã cập nhật" : "Đã liên kết"} **${studentId}** với tài khoản Discord của bạn để nhận QR riêng và đồng bộ điểm danh. MSSV chỉ lưu cục bộ cho tính năng điểm danh, không được đưa vào câu hỏi gửi AI.`
      });
    }

    if (interaction.commandName === "diem-danh-cua-toi") {
      const linkedStudent = findAttendanceStudentForDiscord(db, interaction.user.id);
      if (!linkedStudent) {
        return interaction.reply({ ephemeral: true, content: "Bạn chưa liên kết MSSV. Dùng `/lien-ket-mssv` một lần, sau đó quay lại lấy QR riêng nhé." });
      }
      const session = listOpenAttendanceSessions(db)[0];
      if (!session) {
        const latest = findLatestAttendanceForStudent(db, linkedStudent.student_id);
        if (latest) {
          const time = new Intl.DateTimeFormat("vi-VN", { dateStyle: "medium", timeStyle: "medium", timeZone: "Asia/Ho_Chi_Minh" }).format(new Date(latest.attended_at));
          return interaction.reply({ ephemeral: true, content: `✅ Lần điểm danh gần nhất của bạn: **${latest.title}** (${latest.scope}) lúc **${time}**. Hiện chưa có phiên mới đang mở.` });
        }
        return interaction.reply({ ephemeral: true, content: "Hiện chưa có phiên điểm danh nào đang mở. Bạn có thể chờ admin mở phiên hoặc kiểm tra lại sau nhé." });
      }
      const scopeStatus = attendanceScopeStatus(db, session, { student_id: linkedStudent.student_id, discord_user_id: interaction.user.id });
      if (!scopeStatus.allowed) {
        return interaction.reply({ ephemeral: true, content: `Phiên **${session.title}** chỉ áp dụng cho **${session.scope}**; hồ sơ lớp của bạn không thuộc phạm vi này nên không thể tạo QR điểm danh.` });
      }
      const recorded = findAttendanceRecord(db, session.id, linkedStudent.student_id);
      if (recorded) {
        const time = new Intl.DateTimeFormat("vi-VN", { dateStyle: "medium", timeStyle: "medium", timeZone: "Asia/Ho_Chi_Minh" }).format(new Date(recorded.attended_at));
        return interaction.reply({ ephemeral: true, content: `✅ Bạn đã điểm danh **${session.title}** lúc **${time}**. Không cần quét lại QR.` });
      }
      const personal = createPersonalAttendanceToken(db, {
        token: randomBytes(18).toString("base64url"), session_id: session.id,
        discord_user_id: interaction.user.id, student_id: linkedStudent.student_id,
        student_name: interaction.member?.displayName || interaction.user.globalName || interaction.user.username
      });
      const checkinUrl = personalAttendanceUrl(session, personal.token);
      const image = await QRCode.toBuffer(checkinUrl, { width: 800, margin: 2, errorCorrectionLevel: "M" });
      const attachment = new AttachmentBuilder(image, { name: `qr-rieng-${session.token}.png` });
      const endsAtText = new Intl.DateTimeFormat("vi-VN", { timeStyle: "short", timeZone: "Asia/Ho_Chi_Minh" }).format(new Date(session.ends_at));
      await interaction.reply({
        ephemeral: true,
        content: `📱 **QR điểm danh riêng của bạn — ${session.title}**\nQR này chỉ hiển thị cho bạn và đóng lúc **${endsAtText}**. Quét mã, bấm xác nhận trên điện thoại; sau khi ghi nhận thành công, mình sẽ báo ngay tại đây. Không chia sẻ QR này.`,
        files: [attachment]
      });
      const key = `${session.id}:${interaction.user.id}`;
      pendingAttendanceConfirmations.set(key, {
        interaction,
        sessionId: session.id,
        studentId: linkedStudent.student_id,
        studentName: interaction.member?.displayName || interaction.user.globalName || interaction.user.username,
        sessionTitle: session.title
      });
      return;
    }

    if (interaction.commandName === "mo-diem-danh") {
      if (!attendanceAdmin(interaction)) {
        return interaction.reply({ ephemeral: true, content: "Chỉ người có quyền **Manage Server** mới có thể mở phiên điểm danh." });
      }
      const title = interaction.options.getString("ten_buoi", true).trim();
      let scope;
      try { scope = canonicalAudience(interaction.options.getString("pham_vi")?.trim() || "all"); } catch (error) {
        return interaction.reply({ ephemeral: true, content: error.message });
      }
      const duration = interaction.options.getInteger("thoi_luong_phut", true);
      const baseUrl = interaction.options.getString("link_quet", true).trim();
      if (!title || title.length > 120) return interaction.reply({ ephemeral: true, content: "Tên buổi điểm danh cần từ 1 đến 120 ký tự." });
      if (duration < 1 || duration > 180) return interaction.reply({ ephemeral: true, content: "Thời lượng phải từ 1 đến 180 phút." });

      const tokenValue = randomBytes(18).toString("base64url");
      let checkinUrl;
      try { checkinUrl = publicAttendanceUrl(baseUrl, tokenValue); } catch (error) {
        return interaction.reply({ ephemeral: true, content: error.message });
      }
      const startsAt = new Date().toISOString();
      const endsAt = new Date(Date.now() + duration * 60_000).toISOString();
      const session = createAttendanceSession(db, {
        token: tokenValue, title, scope: scope.slice(0, 80), checkin_url: checkinUrl,
        starts_at: startsAt, ends_at: endsAt
      });
      const image = await QRCode.toBuffer(checkinUrl, { width: 800, margin: 2, errorCorrectionLevel: "M" });
      const attachment = new AttachmentBuilder(image, { name: `diem-danh-${session.token}.png` });
      const endsAtText = new Intl.DateTimeFormat("vi-VN", { timeStyle: "short", timeZone: "Asia/Ho_Chi_Minh" }).format(new Date(endsAt));
      return interaction.reply({
        content: `📌 **Điểm danh: ${session.title}**\nPhạm vi: **${session.scope}** · QR tự đóng lúc **${endsAtText}**.\nQuét QR, nhập họ tên và MSSV để xác nhận. Trạng thái điểm danh được quản lý trên website.`,
        files: [attachment],
        allowedMentions: { parse: [] }
      });
    }

    if (interaction.commandName === "hoi") {
      const question = interaction.options.getString("cau_hoi", true).trim();
      // Keep each question and answer in the channel where it was asked.
      // Only attendance and account-linking commands need an ephemeral response.
      await interaction.deferReply();
      const profile = getDiscordProfile(db, interaction.user.id);
      const result = await answerQuestion(db, question, profile);
      return interaction.editReply(formatAnswer(result));
    }
  } catch (error) {
    console.error(error);
    const text = `Mình chưa thể tra cứu ngay: ${error.message}. Bạn thử lại sau hoặc nhắn @Mod nhé.`;
    if (interaction.deferred || interaction.replied) return interaction.editReply(text.slice(0, 1_900));
    return interaction.reply({ ephemeral: true, content: text.slice(0, 1_900) });
  }
});

client.on(Events.MessageCreate, async message => {
  if (message.author.bot || !client.user || !message.inGuild() || !message.mentions.has(client.user)) return;

  const question = questionAfterMention(message);
  if (!question) {
    const hint = "Chào bạn! Bạn có thể hỏi trực tiếp tại đây, hoặc dùng `/hoi` ngay trong kênh này.";
    return message.reply(hint);
  }

  try {
    await message.channel.sendTyping();
    const profile = getDiscordProfile(db, message.author.id);
    const result = await answerQuestion(db, question, profile);
    const response = formatAnswer(result);
    return message.reply(response);
  } catch (error) {
    console.error(error);
    const fallback = "Mình chưa thể tra cứu ngay. Bạn thử lại sau hoặc nhắn @Mod để được hỗ trợ nhé.";
    return message.reply(fallback);
  }
});

async function stop() {
  db.close();
  client.destroy();
  process.exit(0);
}
process.once("SIGINT", stop);
process.once("SIGTERM", stop);
await client.login(token);
