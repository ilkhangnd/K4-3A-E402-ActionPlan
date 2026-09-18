# Phạm Hồ Quang Dũng — Reflection

> Bản nháp dựa trên các deliverable đang có; Dũng cần đọc lại và chỉ giữ những câu đúng với trải nghiệm cá nhân trước khi nộp.

## Vai trò và phần đã làm

Mình phụ trách backend, prompt và data: SQLite dùng chung cho website/bot, import nguồn official JSON, lọc nguồn theo audience lớp, OpenAI Responses API với `store: false`, cùng guardrail/citation validation trước khi bot trả phản hồi. Mình cũng phụ trách phần Discord bot và QR điểm danh demo. Điểm quan trọng của bản hiện tại là E402 chỉ nhận nguồn E402/3A phù hợp, E403 không bị lẫn vào E402, và D301 có hai deadline của hai đầu việc thì bot phải liệt kê đủ cả hai.

## AI hỗ trợ ở đâu, mình đã kiểm tra lại thế nào

AI hỗ trợ soạn prompt và gợi ý edge case, nhưng decision logic không giao toàn bộ cho model. Trước khi gọi model, hệ thống lọc audience; sau khi model trả về, hệ thống kiểm tra decision, citation và evidence phải thuộc đúng tập nguồn. Mình chạy acceptance test phạm vi lớp và kiểm tra: E402 không nhận nguồn E403, D301 nhận đủ hai deadline chính thức. Những nguồn chưa được xác thực không được import với cờ `official: true`.

## Bài học chính

TC02 và TC19 cho thấy guardrail phải được đặt ở cả hai đầu: chặn yêu cầu ngoại lệ cá nhân trước khi model suy diễn, và không cho model biến “Build Phase” thành ngày bắt đầu áp dụng. Mình nhận ra lỗi nguy hiểm nhất không phải lỗi cú pháp mà là một câu trả lời có vẻ tự tin nhưng sai phạm vi nguồn. Vì vậy kiến trúc cuối giữ website là nơi quản trị nguồn duy nhất, còn Discord chỉ đọc cùng SQLite ở lượt hỏi tiếp theo; không có cache nguồn riêng hay DM làm lệch ngữ cảnh.
