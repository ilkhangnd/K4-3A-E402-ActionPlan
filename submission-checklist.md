# Checklist nộp và pitch — đối chiếu đề Hackathon

_Cập nhật 17/09/2026. Đây là checklist vận hành, không thay thế hướng dẫn/form của BTC._

## Đã có trong repo

- [x] `README.md` có đội trưởng, thành viên và phần việc có tên.
- [x] `CANVAS.md`, `spec.md` (§1–§9), evidence mining và 5 quote ngắn đã ẩn danh.
- [x] Prototype Working tại `codebase/`: SQLite nguồn, OpenAI Responses API thật, `store: false`, không commit `.env`/raw pack.
- [x] Golden set 20 case từ chatlog và kết quả Round 2: 14/20 trả lời trực tiếp, 6/6 safe routing, 0 bịa theo contract.
- [x] `demo-slides.pdf` đúng 6 trang; có `demo-video-script.md` và `dry-run.md`.
- [x] `reflection/` có template riêng từng thành viên; `validation/` có template phiên dùng thử.

## Phải làm thật trước CP5 / CP6

- [ ] Quay và mở thử `demo-backup-cp5.mp4`; CP5 yêu cầu video dự phòng, script không thay thế video.
- [ ] Dry run 5 phút: mỗi người nói phần của mình, demo một happy path và một hard path; điền một dòng kết quả vào `dry-run.md`.
- [ ] Hai thành viên chấm độc lập 5 output trong `eval/rater-calibration.md`, rồi lưu quyết định thật.
- [ ] Kiểm tra `demo-slides.pdf` chứa đúng bản cuối trước khi nộp; không nộp `.pptx` thay PDF.
- [ ] Rà `git status` và `.gitignore`: tuyệt đối không đẩy `.env`, `data/discord-pack/`, `data/official-sources.json`, SQLite hoặc `test-results/` raw.

## Bonus R6 — chỉ làm nếu kịp

- [ ] Có ít nhất 2 người ngoài nhóm dùng thử thật, có task, quan sát, quote nguyên văn và severity trong `validation/`.
- [ ] Có ít nhất một thay đổi được nối thẳng với feedback đó trong `spec.md` §9.

## Điểm cần xác nhận với BTC

1. README gốc nói đội trưởng nộp một form chung; rubric/form được gửi trong lớp từng có hướng dẫn “mỗi thành viên nộp riêng”. Nhóm nên làm theo **form hiện hành** và hỏi coach nếu hai hướng dẫn vẫn mâu thuẫn.
2. README gốc mô tả R6 bằng 5 người ngoài nhóm, còn rubric/guide ghi tối thiểu 2. Dùng rubric/guide để chuẩn bị tối thiểu 2 phiên, nhưng hỏi coach nếu muốn chắc điều kiện bonus.
