# Trần Long Khánh — Reflection

> Bản nháp dựa trên các deliverable đang có; Khánh cần đọc lại và chỉ giữ những câu đúng với trải nghiệm cá nhân trước khi nộp.

## Vai trò và phần đã làm

Mình phụ trách evidence và evaluation: từ Discord pack đã ẩn danh, nhóm chọn lát cắt deadline/khung giờ; mình hỗ trợ xây mining method, golden set 20 case, coverage grid, tiêu chí chấm và bảng kết quả Round 1–2. Mình cũng phân biệt rõ số liệu `6/15` của bot cũ dùng để mô tả pain point với `14/20`, `6/6` của prototype mới — không được dùng lẫn hai loại số liệu này khi pitch.

## AI hỗ trợ ở đâu, mình đã kiểm tra lại thế nào

AI giúp tổng hợp các nhóm câu hỏi và viết cấu trúc bảng test. Phần kiểm tra vẫn phải làm theo contract đã chốt: mỗi case có input, hành vi mong muốn, direct answer hay safe routing; output không có citation/evidence hoặc bịa mốc không được tính pass. Mình giữ raw Discord pack và JSON output cục bộ, chỉ đưa mã tin, batch ID, hash và kết quả đã ẩn dữ liệu vào repo để người khác có thể hiểu cách kiểm tra mà không lộ dữ liệu học viên.

## Bài học chính

TC02 cho thấy “chuyển ticket” không tự động là một câu trả lời kém; với yêu cầu gia hạn/nộp muộn cá nhân, đó là hành vi an toàn đúng thẩm quyền. Vì vậy mình học cách đo hai việc riêng: direct-answer coverage đo độ đầy đủ của nguồn, còn safe routing đo khả năng hệ thống không gây hại khi chưa đủ dữ kiện. Con số 70% không phải để khoe độ chính xác tuyệt đối, mà chỉ rõ phần dữ liệu nào còn phải import.
