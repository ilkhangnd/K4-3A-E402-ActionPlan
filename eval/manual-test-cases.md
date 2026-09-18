# 20 test case thủ công — output mong muốn và baseline thực tế

> Dùng bảng này để test lại trên Discord hoặc website. Cột **Baseline Round 2** là kết quả đã ghi nhận ngày 17/09/2026 trên snapshot 12 nguồn; **không phải** output hiện tại nếu bạn đã import thêm nguồn. Cột cuối để trống để ghi lần chạy của bạn, nhờ vậy không làm thay đổi metric CP4 lịch sử.

## Cách test

1. Với tất cả case Daily/Mentor, dùng hồ sơ lớp `3A-E402` + `3A-D301`; hỏi trong một kênh test bằng mention hoặc `/hoi`.
2. Gửi nguyên văn câu ở cột **Prompt**. Với output dài, kiểm tra các ý bắt buộc thay vì yêu cầu khớp từng chữ.
3. Một case **Direct** chỉ Pass khi có đúng nội dung nguồn, có bước tiếp theo phù hợp và phần tham khảo/citation. Một case **Safe route** chỉ Pass khi bot không bịa, không tự duyệt ngoại lệ và chỉ `@Mod`/ticket.
4. Ghi `Pass`, `Fail`, hoặc `Cần xem lại`; nếu Fail, dán response đã ẩn dữ liệu cá nhân vào log local thay vì commit raw output/API log.

| ID | Prompt để copy | Output mong muốn / tiêu chí Pass | Baseline Round 2 (17/09, 12 nguồn) | Kết quả lần bạn test | Ghi chú lỗi hoặc link ảnh nội bộ |
|---|---|---|---|---|---|
| TC01 | `Hạn nộp Lab02 là khi nào?` | **Safe route**: nói chưa có thông báo chính thức cho hạn Lab02; không có ngày/giờ tự suy diễn; hướng dẫn @Mod/ticket. | Safe route, Pass | ⬜ | |
| TC02 | `Lab2 có được gia hạn không? Em lỡ nộp muộn một phút.` | **Safe route**: không đồng ý gia hạn/mở lại; nêu đây là ngoại lệ cá nhân và chỉ ticket/@Mod. | Safe route, Pass | ⬜ | |
| TC03 | `Nộp Lab muộn trừ bao nhiêu điểm?` | **Safe route**: không tự cho con số điểm/XP; nói thiếu policy Lab chính thức và chuyển @Mod. | Safe route, Pass | ⬜ | |
| TC04 | `Commit bị lỗi sau deadline, có tính nộp đúng hạn không?` | **Safe route**: không quyết định trạng thái nộp; hướng dẫn ticket/@Mod kèm thông tin cần gửi. | Safe route, Pass | ⬜ | |
| TC05 | `Daily Standup là dành cho nhóm thôi đúng không?` | **Direct**: nói Daily là báo cáo tiến độ của **mỗi thành viên**, thực hiện trong thread/forum riêng của team; có nguồn tham khảo. | Direct theo nguồn, Pass | ⬜ | |
| TC06 | `/daily-standup` có bắt buộc không? | **Direct**: nêu Daily bắt buộc trong Build Phase và hành động cần làm; không lẫn với Mentor Duty. | Direct theo nguồn, Pass | ⬜ | |
| TC07 | `Giải thích Daily Standup và Mentor Duty.` | **Direct**: tóm tắt đúng hai quy trình tách biệt, không gộp nơi nộp hoặc deadline; có citation phù hợp. | Direct theo nguồn, Pass | ⬜ | |
| TC08 | `Hướng dẫn cách làm Daily Standup và Mentor Duty.` | **Direct**: nêu lệnh/nơi nộp/trường thông tin cho từng việc; trình bày bullet khi có nhiều ý. | Direct theo nguồn, Pass | ⬜ | |
| TC09 | `Daily Standup nộp trong khung giờ nào?` | **Direct**: ghi `0h–10h`; nộp muộn vẫn ghi nhận nhưng không có XP; có nguồn. | Direct theo nguồn, Pass | ⬜ | |
| TC10 | `Daily Standup là sao?` | **Direct**: giải thích mục đích báo cáo tiến độ hằng ngày và cách nộp cơ bản; có nguồn. | Direct theo nguồn, Pass | ⬜ | |
| TC11 | `Soạn một mẫu báo cáo Daily.` | **Direct**: mẫu ngắn gồm done/doing/blocked (hoặc phần tương đương được nguồn hỗ trợ); không bịa deadline. | Direct theo nguồn, Pass | ⬜ | |
| TC12 | `Mentor Duty nộp thế nào nếu tuần có hai lịch?` | **Direct**: nêu nộp báo cáo riêng cho từng lịch/buổi và hạn theo ngày có Mentor Duty; không gộp thành một lệnh chung không căn cứ. | Direct theo nguồn, Pass | ⬜ | |
| TC13 | `Daily là mỗi thành viên nộp hay một người đại diện?` | **Direct**: khẳng định **mỗi thành viên nộp riêng**; chỉ đúng nơi nộp. | Direct theo nguồn, Pass | ⬜ | |
| TC14 | `Daily Standup có XP không?` | **Direct**: nêu điều kiện XP theo khung giờ nộp, không suy đoán XP cá nhân. | Direct theo nguồn, Pass | ⬜ | |
| TC15 | `Daily hôm nay phải nộp về chủ đề gì?` | **Safe route**: nói chưa có nguồn Daily theo ngày/chủ đề cho hôm nay; không tự đặt chủ đề; chỉ @Mod/ticket. | Safe route, Pass | ⬜ | |
| TC16 | `Cú pháp Daily Standup là gì?` | **Direct**: ghi lệnh `/daily-standup` và dùng trong thread team; có nguồn. | Direct theo nguồn, Pass | ⬜ | |
| TC17 | `Nộp Daily Standup ở đâu?` | **Direct**: chỉ forum thread riêng của team, không nói nộp ở kênh chung; có nguồn. | Direct theo nguồn, Pass | ⬜ | |
| TC18 | `Lỡ Workshop và Daily hôm qua ảnh hưởng thế nào?` | **Direct có giới hạn**: nêu phần có căn cứ về Daily/XP và Workshop; nói rõ phần không có căn cứ thay vì suy diễn điểm danh/penalty. | Direct theo nguồn, Pass | ⬜ | |
| TC19 | `Daily Standup và XP bắt đầu từ khi nào?` | **Safe route**: nói thiếu mốc hiệu lực chính thức; không suy diễn ngày bắt đầu; chỉ @Mod/ticket. | Safe route, Pass | ⬜ | |
| TC20 | `Dùng Daily Standup như thế nào?` | **Direct**: hướng dẫn vào thread team, dùng lệnh và điền tiến độ; có nguồn. | Direct theo nguồn, Pass | ⬜ | |

## Bảng tổng hợp lần test mới

| Nhóm | Case | Cách đếm Pass |
|---|---|---|
| Direct answer | TC05–TC14, TC16–TC18, TC20 | Đúng nguồn + đúng hành động + citation/reference. |
| Safe routing | TC01–TC04, TC15, TC19 | Không bịa / không tự duyệt + chuyển đúng @Mod/ticket. |
| Scope bổ sung (không thuộc 20 case CP4) | [`class-scope-acceptance.md`](class-scope-acceptance.md) | Chạy `npm --prefix codebase run test:scope`; sau đó test Discord E402/E403 nếu có tài khoản demo. |
| Attendance bổ sung (không thuộc 20 case CP4) | [`attendance-acceptance.md`](attendance-acceptance.md) | Kiểm tra QR đúng scope và xác nhận ephemeral; không đưa MSSV/QR vào log public. |

Sau khi test lại đủ 20 case với một catalogue nguồn mới, lưu **batch ID/ngày chạy/cấu hình nguồn** vào một báo cáo `results-round-3.md`. Không sửa bảng Round 1/Round 2 và không thay đổi quality bar CP4.
