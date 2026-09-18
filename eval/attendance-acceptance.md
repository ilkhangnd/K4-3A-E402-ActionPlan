# QR attendance — acceptance checks

Phần này là kiểm thử chức năng bổ sung cho demo điểm danh; không thay đổi golden set 20 câu hay quality bar CP4.

| ID | Tình huống | Kỳ vọng | Trạng thái 17/09/2026 |
| --- | --- | --- | --- |
| AT01 | Admin tạo phiên 10 phút | Có token, QR thực và link `/attendance/<token>` | Pass qua `qrcode` + route tạo phiên |
| AT02 | MSSV hợp lệ điểm danh lần đầu | Lưu một record với timestamp do server tạo, trang báo giờ điểm danh | Pass ở tầng database |
| AT03 | Cùng MSSV gửi lại trong cùng phiên | Không tạo record thứ hai; báo đã điểm danh | Pass ở tầng database |
| AT04 | Admin đóng phiên hoặc QR quá hạn | Không nhận thêm điểm danh | Pass ở tầng database |
| AT05 | QR `localhost` quét từ điện thoại khác | Không dùng được; admin phải thay bằng IP LAN/tunnel | Đã cảnh báo rõ trong UI, cần test mạng cùng Wi-Fi khi demo |
| AT06 | Admin chạy `/mo-diem-danh` | Bot đăng QR PNG thật trong kênh Discord, URL mang token riêng và có hạn | Kiểm tra code + đăng ký slash command; cần quay video thao tác Discord cho demo |
| AT07 | Sinh viên đã dùng `/lien-ket-mssv` rồi check-in QR | Lưu attendance với timestamp server; không mở DM | Kiểm tra integration route; cần test một tài khoản sinh viên thật để chứng minh luồng trên điện thoại |
| AT08 | Sinh viên dùng `/diem-danh-cua-toi` khi có phiên mở | Nhận QR cá nhân dạng ephemeral; chỉ sau khi bấm xác nhận mới tạo record | Pass tầng SQLite: token riêng, record đầu `recorded`, lần hai `duplicate` |
| AT09 | Sinh viên dùng QR admin website/bot đã đăng | Nhập MSSV đã liên kết và nhận timestamp trên trang check-in | Cùng route `recordAttendance` và mapping Discord; cần test trên điện thoại cho video demo |
| AT10 | Hồ sơ Discord `3A-E402` quét QR phiên `3A-E403` | Từ chối với thông báo sai phạm vi; không tạo record điểm danh | Pass tầng backend: `attendanceScopeStatus` kiểm tra profile sau liên kết MSSV |
| AT11 | Quét QR phiên có scope riêng nhưng MSSV chưa liên kết Discord/hồ sơ lớp | Yêu cầu `/thiet-lap` và `/lien-ket-mssv`; không tạo record | Pass tầng backend; phiên `all` vẫn cho phép QR công khai |

## Ranh giới demo

- QR và timestamp là thật, được tạo/lưu cục bộ trong SQLite.
- Không thay thế hệ thống điểm danh chính thức của VinUni; chưa có SSO, kiểm tra vị trí hoặc chống người khác dùng MSSV.
- Họ tên/MSSV attendance không được commit hay đưa vào OpenAI; database SQLite bị `.gitignore`.
- Mở QR trên Discord không thay cho quyền quản trị: chỉ `Manage Server` được dùng `/mo-diem-danh`; sinh viên tự opt-in khi liên kết MSSV để dùng QR riêng. Hỏi đáp vẫn ở kênh Discord gốc, không tách qua DM.
- Phạm vi điểm danh được thực thi ở backend, không chỉ hiện trên UI: phiên `3A-E403` không thể ghi nhận hồ sơ `3A-E402`. Các record tạo trước khi có kiểm tra scope phải được admin rà và gỡ nếu không hợp lệ.
