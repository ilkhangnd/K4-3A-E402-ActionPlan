# Nguyễn Đình Khang — Reflection

> Bản nháp dựa trên các deliverable đang có; Khang cần đọc lại và chỉ giữ những câu đúng với trải nghiệm cá nhân trước khi nộp.

## Vai trò và phần đã làm

Mình phụ trách product, frontend và demo. Phần việc cụ thể là chuyển trải nghiệm từ website demo về đúng ngữ cảnh Discord: người học tag bot hoặc dùng `/hoi` và nhận phản hồi ở chính kênh đang hỏi; website chỉ giữ vai trò quản trị/import nguồn official và quản lý QR điểm danh. Mình cũng phụ trách flow hồ sơ lớp, UI quản trị, kịch bản demo happy path/safe path và cách kể câu chuyện trong pitch deck.

## AI hỗ trợ ở đâu, mình đã kiểm tra lại thế nào

AI giúp mình phác thảo wording, luồng UI và biến các tình huống rủi ro thành nội dung demo dễ hiểu. Mình không dùng output AI như một deadline: các mốc/claim trên UI và slide phải quay lại đối chiếu với nguồn đã import, `spec.md`, golden set và hành vi bot thật. Sau feedback rằng không nên tách chat sang riêng, mình kiểm tra lại luồng để mọi câu hỏi ở General vẫn được bot reply ngay tại General; chỉ QR điểm danh cá nhân mới là ephemeral vì lý do riêng tư.

## Bài học chính

TC19 cho thấy một câu trả lời nghe có vẻ hợp lý vẫn có thể nguy hiểm nếu nó suy ra ngày bắt đầu áp dụng mà nguồn không nói. Bài học product của mình là “câu trả lời hữu ích” không đồng nghĩa “trả lời mọi câu”: cần hiển thị rõ bot chưa đủ căn cứ và cho người học một bước tiếp theo. Việc tách website quản lý nguồn khỏi kênh hỏi đáp cũng làm trách nhiệm rõ hơn: admin cập nhật dữ liệu một nơi, còn người học không bị ép đổi ngữ cảnh.
