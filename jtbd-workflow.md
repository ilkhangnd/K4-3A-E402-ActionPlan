# JTBD workflow — Trợ lý Thực Chiến

## Job executor

Học viên AI20K đang tham gia Build Phase, thường tra cứu lúc cần nộp Daily, Mentor Duty, Workshop, Gate hoặc Lab.

## Workflow hiện tại

```text
Sắp đến việc nộp / phát sinh thắc mắc
        ↓
Tag bot hoặc tìm Discord / Phoenix / VLearn
        ↓
Có thông báo đúng và còn hiệu lực? ── Có → làm theo quy định
        │
        Không
        ↓
Hỏi lại / chờ Mod / tạo ticket
        ↓
Có nguy cơ trễ hạn, mất XP hoặc mất điểm danh
```

## Workflow mong muốn trong server [DEMO] AI20K

```text
/thiet-lap lớp (một lần) → /hoi câu hỏi
        ↓
Trợ lý Thực Chiến đối chiếu SQLite nguồn đã xác thực
        ↓
Có căn cứ trực tiếp? ── Có → câu trả lời ngắn + mã nguồn
        │
        Không / mâu thuẫn / ngoại lệ / dữ liệu cá nhân
        ↓
Không đoán → hướng dẫn @Mod / ticket và thông tin cần gửi
```

**Core JTBD:** Khi sắp nộp một hoạt động của AI20K, tôi muốn biết chính xác quy định hoặc mốc thời gian có căn cứ, để quyết định việc cần làm tiếp theo mà không bị mất XP, điểm danh hoặc lỡ hạn vì thông tin sai.
