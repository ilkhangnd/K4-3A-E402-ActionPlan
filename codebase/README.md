# Codebase — AI Thực Chiến Assistant

Prototype thật cho Track B: **Trợ lý Thực Chiến**, bot Discord tra cứu deadline/quy định AI20K theo nguồn đã xác thực. Web local là màn hình quản trị/quan sát nguồn và phương án demo dự phòng; kênh tương tác mục tiêu là server Discord `[DEMO] AI20K`.

## Phần thật

- Web app local để quản trị nguồn; điểm danh QR có thời hạn được mở trực tiếp từ Discord.
- SQLite lưu nguồn và golden set.
- OpenAI Responses API (`store: false`) trả lời từ nguồn được chọn.
- Kiểm tra citation/evidence nội bộ trước khi trả response.
- Bot Discord có `/hoi`, `/thiet-lap`, `/nguon`, `/mo-diem-danh`, `/lien-ket-mssv`, `/diem-danh-cua-toi`, dùng đúng cùng database và decision logic với web app. Câu hỏi luôn được trả lời ngay tại **kênh Discord nơi người dùng đã hỏi**; bot không dùng DM cho hỏi đáp.

## Giới hạn hiện tại

- Nguồn được nhóm nhập thủ công; chưa đồng bộ Discord, Phoenix hay VLearn.
- Điểm danh QR chỉ lưu họ tên, MSSV và timestamp server cho phiên điểm danh; chưa có đăng nhập VinUni hay xác nhận vị trí, nên chỉ phù hợp demo có giám sát.
- Chạy local; không deploy public.
- Prototype chạy local; để demo Discord cần server, Discord Application và token local thật. Không coi đây là hệ thống production/public.

### Đồng bộ website → Discord

Website admin và bot dùng **cùng SQLite local**, không có bản sao/cache nguồn riêng trong Discord. Mỗi lần admin lưu, sửa hoặc xoá nguồn trên website, bot đọc thay đổi đó ngay ở câu hỏi tiếp theo. `/nguon` luôn truy vấn database hiện tại, không phải danh sách tĩnh.

Phạm vi nguồn được so theo mã lớp đầy đủ: nguồn `3A-E402` chỉ đến E402, nguồn `3A-E403` chỉ đến E403; `3A` là phạm vi chung cho mọi lớp 3A. Xem [quy ước import nguồn](../DATA_FORMAT.md) trước khi nạp dữ liệu.

## Chạy prototype

Từ thư mục `codebase/`:

```bash
npm install
# Nếu chưa có ../.env, tạo từ ../.env.example rồi điền OPENAI_API_KEY.
npm run setup
npm run import:sources
npm start
```

Mở `http://localhost:3000`. Dữ liệu nguồn, Discord pack, SQLite, API key và JSON log thô đều được `.gitignore`; chúng không được đưa lên GitHub.

## Điểm danh QR

1. Trong server Discord, admin có quyền **Manage Server** chạy `/mo-diem-danh` và điền tên buổi, thời lượng, phạm vi và `link_quet`.
2. `link_quet` phải là URL điện thoại truy cập được: URL public/tunnel hoặc IP LAN của máy chạy web, ví dụ `http://192.168.x.x:3000` — không dùng `localhost`.
3. Bot đăng QR thật vào kênh. Sinh viên quét QR, nhập họ tên/MSSV; trang trả timestamp do server tạo.
4. Sinh viên dùng `/lien-ket-mssv` một lần nếu cần QR riêng. Mapping MSSV–Discord chỉ lưu cục bộ cho điểm danh và không gửi vào OpenAI.

### Điểm danh trong kênh Discord

Mỗi sinh viên dùng `/diem-danh-cua-toi` tại kênh Discord. Kết quả là **ephemeral** (chỉ người gọi thấy) để bảo vệ QR riêng, nhưng không tạo DM. Khi quét và bấm xác nhận, bản ghi cùng timestamp server được lưu trên website quản lý điểm danh. Nếu bot còn online, nó phát hiện record mới và gửi tiếp một xác nhận ephemeral “đã điểm danh” trong chính interaction này. Nếu bot bị restart/tắt giữa lúc quét, trang QR vẫn là nguồn xác nhận trực tiếp. QR công khai do admin web/bot đăng cũng dùng cùng hệ thống record.

## Tổ chức Discord theo đúng ngữ cảnh hỏi đáp

- `#general` hoặc bất kỳ kênh nào có quyền bot: tag **Trợ lý AI Thực chiến** để nhận câu trả lời reply ngay dưới tin nhắn tại chính kênh đó.
- `/hoi`: sinh viên gọi ở bất cứ kênh nào; bot hiển thị kết quả ngay trong kênh gọi lệnh.
- Bot không dùng DM cho hỏi đáp: chỉ xử lý mention và `/hoi` trong kênh của server, nên toàn bộ trao đổi luôn ở kênh chính.
- `/diem-danh-cua-toi`: QR riêng tư; `/mo-diem-danh` là thông báo QR chung duy nhất của admin.

Mỗi MSSV chỉ ghi nhận một lần trong mỗi phiên. Admin có thể đóng phiên ngay trong giao diện web dự phòng. Không đưa database điểm danh lên GitHub.

Với phiên có phạm vi riêng như `3A-E402` hoặc `3A-E403`, backend đối chiếu MSSV đã liên kết với hồ sơ lớp Discord trước khi ghi nhận. Sinh viên cần chạy `/thiet-lap` và `/lien-ket-mssv` một lần; QR scope `all` vẫn có thể dùng công khai. Điều này ngăn học viên E402 được tính vào phiên E403.
Acceptance checks của tính năng này ở [`../eval/attendance-acceptance.md`](../eval/attendance-acceptance.md).

## Link HTTPS công khai cho QR (demo an toàn)

Không expose port `3000`: port này có dashboard quản trị và endpoint gọi OpenAI. Thay vào đó, chạy gateway chỉ cho phép route QR/check-in trên port `3001`, rồi tunnel riêng port này:

```bash
npm run start:attendance-gateway
cloudflared tunnel --url http://localhost:3001
```

Lệnh thứ hai in ra URL `https://…trycloudflare.com`. Dán URL đó vào trường `link_quet` khi dùng `/mo-diem-danh`. Link này chỉ tồn tại khi máy và hai tiến trình trên còn chạy; nó phù hợp quay demo. Muốn URL cố định cần Cloudflare named tunnel + domain, hoặc chuyển bot/web/database lên một server có persistent disk.

## Chạy bot Discord — server `[DEMO] AI20K`

Làm theo từng bước tại [`discord-setup.md`](discord-setup.md). Sau khi điền Discord token và IDs vào `../.env` local:

```bash
npm install
npm run discord:register
npm run discord:bot
```

Bot không cần dữ liệu cá nhân. `/thiet-lap` chỉ lưu lớp thực hành/lý thuyết để lọc nguồn; `/hoi` gọi OpenAI API thật và `/nguon` hiển thị danh sách nguồn đã nạp.

## Chạy evaluation

```bash
npm run test:cp3
npm run test:scope
```

Lệnh gọi API thật cho 20 câu golden set, lưu JSON log cục bộ vào `../test-results/`. Bản tổng hợp đã ẩn dữ liệu nhạy cảm được lưu trong `../eval/` để nộp cùng repo.
