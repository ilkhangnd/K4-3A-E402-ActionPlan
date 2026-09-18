# Nguồn thật cho CP3

Tệp có thể là mảng JSON theo format kỹ thuật bên dưới, `{ "sources": [...] }`, hoặc format quản trị tiếng Việt `{ "nguon_du_lieu_chinh_thuc": [...] }`. Website sẽ chuẩn hóa format tiếng Việt trước khi kiểm tra. Mỗi nguồn cần có link HTTPS tới thông báo gốc để người chấm mở kiểm tra.

```json
[
  {
    "id": "discord-message-id",
    "title": "Tiêu đề thông báo nguyên gốc",
    "body": "Nguyên văn thông báo chính thức, không tóm tắt lại.",
    "url": "https://discord.com/channels/.../.../...",
    "published_at": "2026-09-17T10:00:00+07:00",
    "audience": "3A-E402",
    "official": true
  }
]
```

Không nhập tin nhắn học viên, tin bot trả lời tự do, dữ liệu cá nhân, hoặc mốc thời gian do nhóm tự điền. Importer sẽ từ chối record format kỹ thuật không có `official: true`.

## Format quản trị tiếng Việt được hỗ trợ

```json
{
  "nguon_du_lieu_chinh_thuc": [
    {
      "ma_tin_ma_nguon": "AI20K-001",
      "tieu_de_thong_bao": "Tiêu đề thông báo",
      "link_https_thong_bao_chinh_thuc": "https://discord.com/channels/...",
      "pham_vi": ["3A-E402"],
      "ngay_dang": "2026-09-18",
      "nguyen_van_noi_dung_thong_bao_chinh_thuc": "Nguyên văn nội dung..."
    }
  ]
}
```

`pham_vi` có thể là mảng hoặc text, nhưng phải dùng `all`, `3A`, hoặc mã lớp đầy đủ như `3A-E402`. Việc upload là hành động quản trị: người upload vẫn chịu trách nhiệm kiểm tra link và nguyên văn thông báo là nguồn chính thức trước khi bot dùng. Nếu format tiếng Việt để trống link, website lưu `local://official-import/<mã nguồn>` để đánh dấu đây là nguồn admin xác thực cục bộ; nên bổ sung permalink HTTPS khi có để người học mở citation trực tiếp.

## Phạm vi lớp và ngữ nghĩa

- `all`: áp dụng cho mọi học viên.
- `3A`: áp dụng cho mọi lớp thuộc 3A, gồm `3A-E402`, `3A-E403`, `3A-D301`.
- `3A-E402`, `3A-E403`, `3A-D301`: chỉ áp dụng đúng lớp đó. Bot **không** dùng thông báo `3A-E403` để trả lời học viên `3A-E402`.
- Một thông báo cùng áp dụng cho nhiều lớp: ghi các mã đầy đủ, cách nhau bằng dấu phẩy, ví dụ `3A-E402, 3A-D301`.

Mỗi mốc deadline là một nguồn chính thức riêng, giữ nguyên đầu việc và ngày/giờ trong `title`/`body`. Khi D301 có hai deadline cho hai đầu việc khác nhau, nhập hai record cùng `audience: "3A-D301"`; bot sẽ liệt kê cả hai thay vì coi đó là mâu thuẫn. Nếu hai thông báo nói hai mốc khác nhau cho **cùng một đầu việc**, cần xác minh/đánh dấu nguồn hiệu lực mới trước khi import.
