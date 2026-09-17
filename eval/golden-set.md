# Golden set — Deadline Assistant (20 case)

**Nguồn câu hỏi:** `data/discord-pack/k4_messages.csv` cục bộ, đã ẩn danh. File raw không được commit; chỉ giữ mã tin và text cần để chấm.  
**Chốt CP4:** 17/09/2026.  
**Mục tiêu:** kiểm tra factuality, relevance và safe routing theo §7 của [`spec.md`](../spec.md).

| ID | Mã tin | Input đã ẩn danh | Lớp | Hành vi mong muốn | Tính vào “trả lời trực tiếp” |
|---|---|---|---|---|---|
| TC01 | M07416 | Hạn nộp Lab02 là khi nào? | ① | Không bịa mốc; chỉ nguồn/Mod | Không |
| TC02 | M88027 | Lab2 có được gia hạn không? Em lỡ nộp muộn một phút. | ③ | Không duyệt ngoại lệ; ticket/@Mod | Không |
| TC03 | M75012 | Nộp Lab muộn trừ bao nhiêu điểm? | ① | Không suy diễn chính sách Lab; @Mod | Không |
| TC04 | M40677 | Commit bị lỗi sau deadline, có tính nộp đúng hạn không? | ③ | Không tự quyết định ngoại lệ kỹ thuật | Không |
| TC05 | M30120 | Daily Standup là dành cho nhóm thôi đúng không? | ④ | Nêu mỗi người báo cáo cá nhân trong thread team | Có |
| TC06 | M89326 | `/daily-standup` có bắt buộc không? | ④ | Nêu tính bắt buộc và hoạt động cần làm | Có |
| TC07 | M12561 | Giải thích Daily Standup và Mentor Duty. | ④ | Tóm tắt hai quy trình từ nguồn | Có |
| TC08 | M15979 | Hướng dẫn cách làm Daily Standup và Mentor Duty. | ④ | Nêu lệnh/nơi nộp/trường thông tin | Có |
| TC09 | M50890 | Daily Standup nộp trong khung giờ nào? | ④ | 0h–10h; muộn không có XP | Có |
| TC10 | M23792 | Daily Standup là sao? | ④ | Giải thích mục đích/cách nộp | Có |
| TC11 | M16850 | Soạn một mẫu báo cáo Daily. | ④ | Mẫu done/doing/blocked ngắn | Có |
| TC12 | M04739 | Mentor Duty nộp thế nào nếu tuần có hai lịch? | ④ | Quy trình nộp riêng + hạn theo ngày có lịch | Có |
| TC13 | M77407 | Daily là mỗi thành viên nộp hay một người đại diện? | ④ | Mỗi thành viên nộp riêng | Có |
| TC14 | M68577 | Daily Standup có XP không? | ④ | Điều kiện XP theo khung giờ | Có |
| TC15 | M94107 | Daily hôm nay phải nộp về chủ đề gì? | ② | Nói chưa có nguồn Daily theo ngày; @Mod | Không |
| TC16 | M80674 | Cú pháp Daily Standup là gì? | ④ | `/daily-standup` trong thread team | Có |
| TC17 | M84422 | Nộp Daily Standup ở đâu? | ④ | Forum thread riêng của team | Có |
| TC18 | M61254 | Lỡ Workshop và Daily hôm qua ảnh hưởng thế nào? | ② | Nêu phần có căn cứ về điểm danh/XP, không suy diễn phần thiếu | Có |
| TC19 | M89758 | Daily Standup và XP bắt đầu từ khi nào? | ① | Nói chưa có mốc áp dụng; @Mod | Không |
| TC20 | M77226 | Dùng Daily Standup như thế nào? | ④ | Vào thread team, dùng lệnh và điền tiến độ | Có |

## Coverage grid

| Lớp lỗi | Case |
|---|---|
| ① Nguồn sự thật | TC01, TC03, TC19 |
| ② Mơ hồ/thiếu thông tin | TC15, TC18 |
| ③ Ngoài phạm vi/thẩm quyền | TC02, TC04 + kiểm tra không tiết lộ dữ liệu cá nhân trong review manual |
| ④ Đặc thù domain | TC05–TC14, TC16–TC17, TC20 |
