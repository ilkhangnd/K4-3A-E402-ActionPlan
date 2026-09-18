# Acceptance test — phạm vi lớp và deadline

Thực hiện trên website quản lý nguồn tại `http://localhost:3000` và server Discord sau khi restart bot. Mỗi record chỉ được nhập từ thông báo chính thức thật; thay nội dung minh hoạ dưới đây bằng nguyên văn thông báo/link thực tế.

## Dữ liệu chuẩn bị

| Mã nguồn | Phạm vi (`audience`) | Nội dung cần có |
| --- | --- | --- |
| `TEST-E402-PRACTICE` | `3A-E402` | Thông báo/lịch riêng cho lớp thực hành E402. |
| `TEST-E403-PRACTICE` | `3A-E403` | Thông báo/lịch riêng cho lớp thực hành E403. |
| `TEST-D301-DEADLINE-A` | `3A-D301` | Deadline chính thức cho đầu việc A của D301. |
| `TEST-D301-DEADLINE-B` | `3A-D301` | Deadline chính thức cho đầu việc B khác của D301. |
| `TEST-3A-GENERAL` | `3A` | Một quy định áp dụng chung cho mọi lớp 3A. |

## Test cases

| ID | Thiết lập / câu hỏi | Kết quả mong đợi |
| --- | --- | --- |
| SC-01 | Hồ sơ Discord: thực hành `3A-E402`, lý thuyết `3A-D301`. Tag bot: “Thông báo lớp thực hành của tôi là gì?” | Chỉ trả lời theo `TEST-E402-PRACTICE`; không có nội dung hoặc link của E403. |
| SC-02 | Với hồ sơ SC-01, hỏi “Lịch lớp E403 thế nào?” | Bot không dùng `TEST-E403-PRACTICE`; trả lời thiếu nguồn phù hợp hoặc yêu cầu dùng đúng hồ sơ lớp. |
| SC-03 | Đổi hồ sơ thực hành thành `3A-E403`; hỏi lại câu SC-01. | Chỉ trả lời theo `TEST-E403-PRACTICE`; không đưa thông tin E402. |
| SC-04 | Hồ sơ như SC-01. Hỏi về quy định chung 3A. | Bot có thể dùng `TEST-3A-GENERAL`. |
| SC-05 | Hồ sơ như SC-01. Hỏi: “D301 hiện có những deadline chính thức nào?” | Câu trả lời liệt kê cả đầu việc A và B, mỗi đầu việc đi cùng deadline từ nguồn tương ứng. |
| SC-06 | Nhập hai nguồn D301 nói hai mốc khác nhau cho cùng một đầu việc. Hỏi deadline của đầu việc đó. | Bot không tự chọn một mốc; nêu cần @Mod xác minh nguồn đang hiệu lực. |
| SC-07 | Trong trang quản lý nguồn, nhập `audience: 3A-E402, 3A-D301`. | Lưu thành công và hiển thị phạm vi chuẩn hoá `3A-E402, 3A-D301`. |
| SC-08 | Trong trang quản lý nguồn, nhập `audience: all, 3A-E402` hoặc `E402`. | Hệ thống từ chối và nêu đúng format phạm vi. |

## Điều kiện đạt

- Không có câu trả lời nào rò nội dung nguồn E403 sang E402.
- Mỗi câu trả lời có nguồn đều hiển thị link tham khảo đúng nguồn.
- Hai deadline khác đầu việc của D301 được liệt kê đầy đủ, không bị gộp thành một deadline.
- Câu hỏi và phản hồi đều ở chính kênh Discord đang hỏi, không bị chuyển sang DM.
