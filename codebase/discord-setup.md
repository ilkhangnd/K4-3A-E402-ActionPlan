# Đưa Trợ lý Thực Chiến vào Discord thật

## Mục tiêu demo

- Server: **`[DEMO] AI20K`**
- Bot/app: **`Trợ lý Thực Chiến`**
- Kênh gợi ý: `#hoi-tro-ly`, `#nguon-chinh-thuc`, `#mod-support`
- Chức năng: mention `@Trợ lý AI Thực chiến câu hỏi`, `/hoi`, `/thiet-lap`, `/nguon` — cùng SQLite nguồn và OpenAI API với web app, không có câu trả lời hard-code.

## Một lần thiết lập bằng tài khoản Discord của nhóm

1. Trong Discord, chọn **Add a Server** → **Create My Own** → đặt tên `[DEMO] AI20K`.
2. Vào [Discord Developer Portal](https://discord.com/developers/applications) → **New Application** → đặt tên `Trợ lý Thực Chiến`.
3. Ở **Bot**, tạo bot và reset/copy token. Không gửi token qua chat, không đưa vào Git.
4. Cũng ở trang **Bot**, kéo đến **Privileged Gateway Intents** và bật **MESSAGE CONTENT INTENT**, rồi bấm **Save Changes**. Quyền này chỉ để bot đọc phần câu hỏi khi học viên chủ động mention bot; bot bỏ qua mọi tin không mention nó.
5. Trong **OAuth2 → URL Generator**, chọn scope `bot` và `applications.commands`; chọn tối thiểu quyền `View Channels`, `Send Messages`, `Use Application Commands`, `Embed Links`, `Read Message History`. Mở URL tạo ra và chọn server `[DEMO] AI20K` để mời bot.
6. Lấy Application ID ở **General Information** và Server ID bằng Discord Developer Mode → chuột phải server → **Copy Server ID**.
7. Điền vào file `../.env` local: `DISCORD_BOT_TOKEN`, `DISCORD_APPLICATION_ID`, `DISCORD_GUILD_ID`. File này đã bị ignore.
8. Từ `codebase/`, cài dependency, đăng ký command và chạy bot:

```bash
npm install
npm run discord:register
npm run discord:bot
```

9. Trong server, chạy `/thiet-lap`, rồi thử `@Trợ lý AI Thực chiến Daily Standup nộp trong khung giờ nào?` (hoặc `/hoi cau_hoi:...`) để chứng minh bot trả lời từ nguồn thật. Thử tiếp câu Lab thiếu căn cứ để demo safe routing.

## Ranh giới bảo mật

- Không dùng token bot, token người dùng, API key, raw Discord pack hoặc SQLite làm nội dung demo/push Git.
- `/thiet-lap` chỉ lưu lớp thực hành/lý thuyết theo Discord user ID; không hỏi hay lưu MSSV.
- Chỉ người trong nhóm cập nhật nguồn ở web local. Bot Discord chỉ đọc nguồn đã xác thực.
