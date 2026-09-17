import { Client, Events, GatewayIntentBits } from "discord.js";
import { answerQuestion, keyStatus } from "./lib/assistant.mjs";
import { getDiscordProfile, listSources, openDatabase, saveDiscordProfile } from "./lib/database.mjs";

const token = process.env.DISCORD_BOT_TOKEN;
if (!token) throw new Error("Thiếu DISCORD_BOT_TOKEN. Xem discord-setup.md; không commit token.");
if (!keyStatus()) throw new Error("Thiếu OPENAI_API_KEY. Bot không được chạy với câu trả lời mock.");

const db = openDatabase();
const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
});
const classPattern = /^[0-9]+[A-Z](?:-[A-Z][0-9]{3})?$/;
const normaliseClass = value => value.trim().toUpperCase().replace(/\s+/g, "");

function shortSourceList() {
  return listSources(db).slice(0, 12).map(source => `• **${source.title}** — phạm vi: ${source.audience || "all"}`).join("\n");
}

function formatAnswer(result) {
  const safeAnswer = result.answer.slice(0, 1_600);
  const notice = result.decision === "escalate"
    ? "\n\n⚠️ Mình chưa tự quyết định trường hợp này. Bạn hãy gửi @Mod tên bài và thời điểm thao tác để được xác minh."
    : "";
  const sourceNote = result.decision === "answer" && result.citations.length
    ? `\n\n_Đã đối chiếu nguồn: ${result.citations.join(", ")}_`
    : "";
  return `${safeAnswer}${notice}${sourceNote}`;
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
      return interaction.reply({ ephemeral: true, content: `Mình đang dùng **${count} nguồn chính thức đã nạp**:\n${shortSourceList() || "Chưa có nguồn."}\n\nNguồn mới phải được người trong nhóm xác thực trước khi bot dùng để trả lời.` });
    }

    if (interaction.commandName === "hoi") {
      const question = interaction.options.getString("cau_hoi", true).trim();
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
  if (message.author.bot || !client.user || !message.mentions.has(client.user)) return;

  const question = questionAfterMention(message);
  if (!question) {
    return message.reply("Chào bạn! Bạn có thể hỏi ngay sau khi mention mình, ví dụ: `@Trợ lý AI Thực chiến Daily Standup nộp lúc nào?`");
  }

  try {
    await message.channel.sendTyping();
    const profile = getDiscordProfile(db, message.author.id);
    const result = await answerQuestion(db, question, profile);
    return message.reply(formatAnswer(result));
  } catch (error) {
    console.error(error);
    return message.reply("Mình chưa thể tra cứu ngay. Bạn thử lại sau hoặc nhắn @Mod để được hỗ trợ nhé.");
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
