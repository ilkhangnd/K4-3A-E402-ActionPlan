# Evaluation — AI Thực Chiến Assistant

Thư mục này chỉ chứa bộ test và báo cáo đã ẩn dữ liệu nhạy cảm. Discord pack, API key, SQLite nguồn và JSON output thô không được commit.

## Thành phần

- `golden-set.md`: 20 câu hỏi được phát triển từ Discord pack đã ẩn danh.
- `manual-test-cases.md`: bảng copy/paste đủ 20 prompt, output mong muốn, baseline Round 2 và ô ghi kết quả test lại.
- `mining-method.md`: cách tạo bộ câu hỏi mà không công khai raw pack.
- `user-input-grid.md`: coverage theo các chiều làm thay đổi câu trả lời đúng.
- `red-team.md`: 3 case hiếm kiểm tra ranh giới an toàn; không đổi mẫu số quality bar đã khóa.
- `rater-calibration.md`: biểu mẫu hai người chấm độc lập 5 output, chỉ điền sau phiên chấm thật.
- `results-round-*.md`: bảng kết quả các lần chạy bằng OpenAI API thật.

## Cách tái chạy

Từ `codebase/`, sau khi cấu hình `../.env` và nạp nguồn cục bộ:

```bash
npm run test:cp3
```

Lệnh lưu JSON log thô vào `../test-results/` (đã `.gitignore`). Khi cập nhật báo cáo, chỉ đưa vào Git batch ID, cấu hình chạy, trạng thái mỗi TC và phân tích lỗi; không đưa câu hỏi raw, output raw, API request ID hoặc nội dung nguồn riêng tư.
