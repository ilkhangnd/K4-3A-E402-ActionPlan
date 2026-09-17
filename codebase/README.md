# Codebase — AI Thực Chiến Assistant

Prototype thật cho Track B: **Trợ lý Thực Chiến**, bot Discord tra cứu deadline/quy định AI20K theo nguồn đã xác thực. Web local là màn hình quản trị/quan sát nguồn và phương án demo dự phòng; kênh tương tác mục tiêu là server Discord `[DEMO] AI20K`.

## Phần thật

- Web app local với profile lớp học.
- SQLite lưu nguồn và golden set.
- OpenAI Responses API (`store: false`) trả lời từ nguồn được chọn.
- Kiểm tra citation/evidence nội bộ trước khi trả response.
- Bot Discord có `/hoi`, `/thiet-lap`, `/nguon`, dùng đúng cùng database và decision logic với web app.

## Giới hạn hiện tại

- Nguồn được nhóm nhập thủ công; chưa đồng bộ Discord, Phoenix hay VLearn.
- Không có đăng nhập và không truy vấn XP, điểm danh hoặc bài nộp cá nhân.
- Chạy local; không deploy public.
- Chưa khẳng định bot Discord đã hoạt động cho tới khi có server demo, Discord Application và token local thật.

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
```

Lệnh gọi API thật cho 20 câu golden set, lưu JSON log cục bộ vào `../test-results/`. Bản tổng hợp đã ẩn dữ liệu nhạy cảm được lưu trong `../eval/` để nộp cùng repo.
