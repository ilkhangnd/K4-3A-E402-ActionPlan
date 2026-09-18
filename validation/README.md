# Validation với người ngoài nhóm — trạng thái và protocol

## Trạng thái trung thực hiện tại

**Chưa có phiên validation với người ngoài nhóm được ghi nhận đủ consent, task, quan sát và quote.** Vì vậy nhóm không tính bonus R6, không ghi số người thử, không gán quote, và không suy diễn các ảnh Discord nội bộ thành dữ liệu nghiên cứu người dùng.

Các kết quả `14/20`, `6/6` và `0` trong `eval/` là **golden-set evaluation của prototype**, không phải validation với người dùng. Hai loại bằng chứng phải được giữ tách biệt.

## Mục tiêu validation khi có willing user

Kiểm tra outcome thực tế, không kiểm tra kiến thức kỹ thuật của người thử:

1. Người học có tìm được mốc Daily và biết hành động tiếp theo không?
2. Khi thiếu hạn Lab02 hoặc hỏi thông tin không thuộc lớp, họ có hiểu vì sao bot không trả lời và biết liên hệ @Mod/ticket không?
3. Câu trả lời có ở đúng kênh Discord người học vừa hỏi, không làm họ bị chuyển sang DM/luồng khác không?

## Protocol cho một phiên (8–10 phút)

1. Xin đồng ý trước: ghi rõ đây là prototype demo; không thu API key, chat history, ảnh đại diện, MSSV, XP hay dữ liệu điểm danh.
2. Người điều phối chỉ đọc task, không chỉ thao tác. Có thể quay màn hình khi người thử đồng ý; nếu không, chỉ ghi note ẩn danh.
3. Người thử làm lần lượt hai task. Đo thời điểm bắt đầu/kết thúc và ghi hành vi quan sát được, không diễn giải thay người thử.
4. Hỏi ba câu kết thúc: “Bạn nghĩ bot đã dựa vào gì?”, “Nếu bot không trả lời, bạn sẽ làm gì?”, “Có điểm nào làm bạn chậm hoặc không tin?”
5. Dùng mã `WU-01`, `WU-02` thay tên. Chỉ lưu quote nguyên văn sau khi người thử cho phép.
6. Nhóm họp xem feedback. Chỉ khi một thay đổi thật sự được làm thì ghi thêm một dòng vào `spec.md` §9 với mã session và lý do.

## Task script cố định

| Task | Setup | Outcome đạt | Không gợi ý thao tác |
|---|---|---|---|
| V-01 · Happy path | Hồ sơ `3A-E402` + `3A-D301`; nguồn Daily đã import | Tìm được khung `0h–10h`, hiểu nộp muộn vẫn được ghi nhận nhưng không có XP, và thấy nguồn tham khảo | “Bạn cần biết Daily Standup nộp trong giờ nào. Hãy dùng Discord như bình thường.” |
| V-02 · Safe path | Cùng hồ sơ; chưa import deadline Lab02 | Bot không bịa deadline; người thử nói được bước tiếp theo là @Mod/ticket hoặc bổ sung nguồn chính thức | “Bạn cần biết hạn Lab02. Hãy thử hỏi bot.” |
| V-03 · Scope path (tùy chọn) | Hồ sơ E402; có nguồn chỉ cho E403 | Bot không lộ thông tin E403; người thử hiểu lý do phạm vi lớp | “Bạn đang ở E402, thử hỏi lịch E403 và nói điều bạn hiểu từ câu trả lời.” |

## Cách ghi nhận

Dùng [`session-log.md`](session-log.md) cho kết quả. Không điền sẵn nội dung quan sát hoặc quote. Severity dùng các mức:

- `Blocker`: người học bị dẫn tới thao tác/đầu việc sai hoặc không hoàn thành task.
- `Major`: hoàn thành task nhưng không hiểu căn cứ hoặc bước tiếp theo.
- `Minor`: hoàn thành task nhưng chậm, lúng túng hoặc wording chưa rõ.
- `Insight`: gợi ý cải thiện, không cản task.

Sau ít nhất hai phiên, ghi một thay đổi thực hiện từ feedback vào `spec.md` §9. Nếu không thay đổi, ghi lý do có căn cứ; không đánh dấu R6 là hoàn thành.
