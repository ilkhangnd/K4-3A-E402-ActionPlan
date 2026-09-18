# Kịch bản quay demo — CP3 và CP5

> Đây là kịch bản quay, **không phải video đã quay**. Chỉ tick checklist trong [`dry-run.md`](dry-run.md) sau khi mở và kiểm tra file video thật.

## CP3 — video thao tác 30 giây

Mục tiêu: cho thấy một lần gọi AI thật, dùng nguồn đã xác thực và không đoán khi thiếu căn cứ.

1. **0–5s:** Mở `#general`, hồ sơ đã là `3A-E402` + `3A-D301`; nhập mention: “Daily Standup nộp trong khung giờ nào?”.
2. **5–16s:** Bot trả lời ngay dưới tin nhắn: phần “Thông tin chính”, các bullet mốc/XP và “Tham khảo thêm tại” từ nguồn official.
3. **16–25s:** Hỏi “Hạn nộp Lab02 là khi nào?”. Bot không đặt deadline, nói thiếu nguồn và hướng dẫn `@Mod`/ticket.
4. **25–30s:** Hiện bảng số đo: golden set 20 câu, **14/20 direct**, **6/6 safe routing**, **0 fabricated**. Chỉ đọc đây là kết quả snapshot Round 2, không phải user validation.

## CP5 — video dự phòng cho pitch

Mục tiêu: quay đúng happy path và hard path định demo trên sân khấu, khoảng 45–60 giây.

1. Mở slide 5 hoặc Discord `#general`; nêu “Discord là nơi hỏi, website chỉ quản trị nguồn/QR”.
2. Happy path: profile E402 hỏi lịch thực hành; bot chỉ lấy nguồn E402 và trình bày lịch theo bullet/citation.
3. Hard path scope: từ profile E402 hỏi lịch E403; bot không lộ nội dung E403, chuyển về thông tin đúng phạm vi/@Mod.
4. Hard path conflict: với hai nguồn D301 khác giờ cho cùng LEC, bot không tự chọn giờ mà nêu hai nguồn cần Mod xác minh.
5. (Nếu demo điểm danh) Gọi `/diem-danh-cua-toi`, quét QR, bấm xác nhận; cho thấy phản hồi ephemeral “đã điểm danh” và timestamp. Không quay/hiện MSSV, QR token, Discord ID hoặc dữ liệu người khác.

## Trước khi nộp video

- Đổi sang dữ liệu demo không có thông tin cá nhân.
- Quay màn hình thật, xuất `demo-cp3-30s.mp4` và `demo-backup-cp5.mp4` ở nơi BTC yêu cầu; không thêm video vào Git nếu form có giới hạn dung lượng.
- Mở từng file từ đầu đến cuối, ghi kết quả vào [`dry-run.md`](dry-run.md).
