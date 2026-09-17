# Phương pháp tạo golden set

## Nguồn và quyền riêng tư

Discord pack cục bộ gồm 1.092 tin nhắn public của Cohort 4 đã được BTC ẩn danh. Pack không được commit public. Golden set chỉ lưu mã case, mô tả scenario và mã tin đã ẩn danh để nhóm có thể kiểm tra lại trên máy có pack.

## Quy trình

1. Lọc tin nhắn người dùng (`is_bot = False`) có từ khoá thời hạn: `hạn`, `deadline`, `muộn`, `trễ`, `khung giờ`, `mấy giờ`, `hết hạn`, `gia hạn`, `23:59`, `10h`.
2. Giữ lại các tin đồng thời nhắc đến hoạt động nộp: `nộp`, `submit`, `lab`, `daily`, `standup`, `mentor duty`, `bài`.
3. Tập thô có 28 tin; đọc thủ công và loại 8 tin không phải câu hỏi về deadline/quy định nộp.
4. Giữ 20 tình huống, bao gồm câu có căn cứ và câu phải chuyển Mod/ticket. Các tình huống được ánh xạ vào TC01–TC20 trong `golden-set.md`.

## Tái lập nội bộ

Khi Discord pack được cấp hợp lệ ở máy local, chạy từ `codebase/`:

```bash
npm run import:golden-set
```

Lệnh chỉ nạp 20 câu được chọn vào SQLite local. Nó không xuất pack hay nội dung chat ra Git.
