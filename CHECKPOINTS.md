# Bàn giao checkpoint — Trợ lý AI Thực Chiến

> Bản chỉ mục này đồng bộ các artefact nộp CP2–CP5. Nó phân biệt rõ bằng chứng đã có với việc còn phải quay/chạy với người thật; không dùng kết quả test nội bộ để thay cho validation.

| Checkpoint | Yêu cầu | Artefact nộp / bằng chứng | Trạng thái trung thực |
|---|---|---|---|
| **CP2** | Thể hiện luồng đầu-cuối | [`jtbd-workflow.md`](jtbd-workflow.md) và mock bấm được [`codebase/public/cp2-ui.html`](codebase/public/cp2-ui.html) | Có. Luồng hiện tại phản ánh Discord là nơi hỏi đáp, website chỉ quản trị nguồn/QR. |
| **CP3** | Video thao tác 30 giây + số đo | Golden set [`eval/golden-set.md`](eval/golden-set.md), bảng test copy/paste [`eval/manual-test-cases.md`](eval/manual-test-cases.md), hai lượt chạy [`eval/results-round-1.md`](eval/results-round-1.md), [`eval/results-round-2.md`](eval/results-round-2.md), kịch bản quay [`demo-video-script.md`](demo-video-script.md) | Có số đo thật: **14/20** trả lời trực tiếp đúng nguồn, **6/6** safe routing, **0** bịa theo contract. Chưa có file video 30 giây trong repo. |
| **CP4** | Khóa spec và chuẩn đạt | [`spec.md`](spec.md) §7, cùng [`eval/user-input-grid.md`](eval/user-input-grid.md), [`eval/red-team.md`](eval/red-team.md) | Có. Quality bar giữ nguyên: ≥14/20 direct và 100% safe routing; các bổ sung sau CP4 không sửa hồi tố kết quả. |
| **CP5** | PDF 6 trang + video dự phòng | [`demo-slides.pdf`](demo-slides.pdf), [`dry-run.md`](dry-run.md), kịch bản [`demo-video-script.md`](demo-video-script.md) | PDF đã đúng 6 trang. Chưa có `demo-backup-cp5.mp4`/dry run thật nên không đánh dấu hoàn thành. |

## Trạng thái prototype ở lần bàn giao

- Bot trả lời tại **đúng kênh Discord đang được hỏi**, không tách hội thoại qua DM.
- Website và bot dùng cùng SQLite: admin import nguồn trên website, bot dùng ngay ở lượt hỏi sau.
- Demo local hiện có **28 nguồn official**. Đây là catalogue vận hành sau các lần import; Round 2 vẫn là snapshot 12 nguồn ngày 17/09 và không đổi số hồi tố.
- Nguồn được lọc theo `all`, `3A`, `3A-E402`, `3A-E403`, `3A-D301`; test scope được mô tả ở [`eval/class-scope-acceptance.md`](eval/class-scope-acceptance.md).
- QR scope riêng được backend kiểm tra lớp đã liên kết. `/diem-danh-cua-toi` gửi QR ephemeral và, khi bot còn online, phản hồi ephemeral xác nhận sau khi check-in thành công. Chi tiết/giới hạn ở [`eval/attendance-acceptance.md`](eval/attendance-acceptance.md).

## Cấu trúc cần giữ khi nộp

```text
repo/
├── README.md
├── spec.md
├── demo-slides.pdf
├── codebase/
├── eval/
├── validation/
└── reflection/
```

Các thư mục `data/`, `test-results/`, `output/`, `tmp/` và `.cp5-*` là dữ liệu local/build hoặc bản trung gian; chúng không phải artefact để đẩy lên repo công khai. Không commit `.env`, SQLite, raw Discord pack, log API, MSSV hay ảnh QR cá nhân.
