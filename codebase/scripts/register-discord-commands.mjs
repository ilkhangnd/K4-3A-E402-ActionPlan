import { REST, Routes, SlashCommandBuilder } from "discord.js";

const token = process.env.DISCORD_BOT_TOKEN;
const applicationId = process.env.DISCORD_APPLICATION_ID;
const guildId = process.env.DISCORD_GUILD_ID;
for (const [key, value] of Object.entries({ DISCORD_BOT_TOKEN: token, DISCORD_APPLICATION_ID: applicationId, DISCORD_GUILD_ID: guildId })) {
  if (!value) throw new Error(`Thiếu ${key}. Xem ../discord-setup.md.`);
}

const commands = [
  new SlashCommandBuilder()
    .setName("hoi")
    .setDescription("Hỏi Trợ lý Thực Chiến về deadline hoặc quy định")
    .addStringOption(option => option.setName("cau_hoi").setDescription("Ví dụ: Daily Standup nộp trong khung giờ nào?").setRequired(true)),
  new SlashCommandBuilder()
    .setName("thiet-lap")
    .setDescription("Lưu lớp để Trợ lý lọc nguồn phù hợp")
    .addStringOption(option => option.setName("lop_thuc_hanh").setDescription("Ví dụ: 3A-E402 hoặc 3B").setRequired(true))
    .addStringOption(option => option.setName("lop_ly_thuyet").setDescription("Ví dụ: 3A-D301 hoặc 3B").setRequired(true)),
  new SlashCommandBuilder()
    .setName("nguon")
    .setDescription("Xem các nguồn chính thức Trợ lý đang dùng"),
  new SlashCommandBuilder()
    .setName("lien-ket-mssv")
    .setDescription("Liên kết MSSV để nhận QR riêng và đồng bộ điểm danh")
    .addStringOption(option => option.setName("mssv").setDescription("MSSV dùng khi quét QR").setRequired(true)),
  new SlashCommandBuilder()
    .setName("diem-danh-cua-toi")
    .setDescription("Nhận QR riêng và xem trạng thái điểm danh của bạn"),
  new SlashCommandBuilder()
    .setName("mo-diem-danh")
    .setDescription("Mở điểm danh QR trong kênh này (quản trị viên)")
    .addStringOption(option => option.setName("ten_buoi").setDescription("Ví dụ: Workshop ngày 2").setRequired(true))
    .addIntegerOption(option => option.setName("thoi_luong_phut").setDescription("Từ 1 đến 180 phút").setMinValue(1).setMaxValue(180).setRequired(true))
    .addStringOption(option => option.setName("link_quet").setDescription("URL public hoặc IP LAN của web app, không dùng localhost").setRequired(true))
    .addStringOption(option => option.setName("pham_vi").setDescription("Ví dụ: all, 3A-E402 hoặc 3B").setRequired(false))
].map(command => command.toJSON());

const rest = new REST({ version: "10" }).setToken(token);
await rest.put(Routes.applicationGuildCommands(applicationId, guildId), { body: commands });
console.log(`Đã đăng ký ${commands.length} slash command cho server demo ${guildId}.`);
