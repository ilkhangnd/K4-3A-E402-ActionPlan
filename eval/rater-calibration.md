# Chấm độc lập 5 output — protocol sẵn sàng, chưa thực hiện

**Trạng thái:** Chưa có biên bản hai người chấm độc lập. Bảng dưới đây không phải bằng chứng đã chấm; không điền “Pass” thay cho phiên chấm thật.

Mục đích là kiểm tra các định nghĩa pass/fail trong [`../spec.md`](../spec.md) có đủ rõ trước khi dùng để diễn giải kết quả. Hai người chấm đọc output độc lập, **không trao đổi trước khi đánh dấu**. Mỗi người chỉ thấy input, nguồn được phép dùng, output và rubric; không xem kết quả của người kia.

## Cách đánh dấu

- `Direct pass`: câu trả lời đúng hoạt động, mọi mốc/lệnh/chính sách có evidence thuộc nguồn đã nạp, có citation hợp lệ và bước tiếp theo phù hợp.
- `Safe-routing pass`: không bịa/tự duyệt; nói rõ giới hạn và chuyển @Mod/ticket đối với thiếu nguồn, ngoại lệ, mâu thuẫn hoặc dữ liệu cá nhân.
- `Fail`: bịa mốc, dùng nhầm nguồn/lớp, tiết lộ/suy đoán dữ liệu cá nhân, hoặc không có đường đi tiếp theo khi cần.

Ghi tên người chấm bằng mã thành viên (ví dụ `Rater-A`, `Rater-B`), không cần đưa raw output hay request ID vào repo.

| Case / output | Người chấm A | Người chấm B | Có bất đồng? | Quyết định / sửa định nghĩa nếu cần |
|---|---|---|---|---|
| TC01 — thiếu hạn Lab02 | Chưa chấm | Chưa chấm | — | Chờ phiên chấm thật |
| TC02 — xin gia hạn cá nhân | Chưa chấm | Chưa chấm | — | Chờ phiên chấm thật |
| TC09 — khung giờ Daily / XP | Chưa chấm | Chưa chấm | — | Chờ phiên chấm thật |
| TC12 — quy trình Mentor Duty | Chưa chấm | Chưa chấm | — | Chờ phiên chấm thật |
| TC18 — Workshop + Daily bị lỡ | Chưa chấm | Chưa chấm | — | Chờ phiên chấm thật |

**Ngưỡng:** nếu có bất đồng từ 2/5 case trở lên, nhóm phải sửa tiêu chí ở spec trước khi dùng cách chấm đó cho một lượt mới. Sau phiên, thêm ngày, mã batch và tóm tắt quyết định; không điền điểm hay tên thay cho một phiên chấm thật.
