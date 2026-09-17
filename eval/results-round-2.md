# Kết quả golden set — Round 2

## Cấu hình lượt chạy

| Trường | Giá trị |
|---|---|
| Ngày chạy | 17/09/2026 |
| Batch ID | `53b2d6af-572e-489e-a5cd-f2feae48d8a2` |
| Cách chạy | `cd codebase && npm run test:cp3` |
| Hệ thống | SQLite local → OpenAI Responses API thật (`store: false`) |
| Model | `gpt-5` |
| Nguồn đã nạp | 12 nguồn đã xác thực |
| Golden set | 20 case phát triển từ Discord pack đã ẩn danh |
| Dấu vết log cục bộ | SHA-256 `7f47b5ee7a62c1bd1ef6dc33728827862d66eddcd8c9b6f3ee6759c8eaf863c2` của file JSON Round 2 |

JSON log đầy đủ được lưu local tại `test-results/cp3-53b2d6af-572e-489e-a5cd-f2feae48d8a2.json` và bị `.gitignore`. Báo cáo này chỉ giữ ID, hành vi mong đợi và kết quả để không công khai raw chat, output API, request ID hoặc nội dung nguồn riêng tư.

## Kết quả

| ID | Hành vi mong đợi | Kết quả thực tế | Chấm |
|---|---|---|---|
| TC01 | Chuyển Mod vì thiếu hạn Lab02 | Chuyển Mod | Pass |
| TC02 | Chuyển ticket cho xin gia hạn cá nhân | Chuyển ticket/@Mod | Pass |
| TC03 | Không suy đoán chính sách Lab muộn | Chuyển Mod | Pass |
| TC04 | Không tự xét ngoại lệ lỗi commit | Chuyển ticket/@Mod | Pass |
| TC05 | Giải thích Daily theo nguồn | Trả lời có căn cứ | Pass |
| TC06 | Giải thích tính bắt buộc Daily | Trả lời có căn cứ | Pass |
| TC07 | Giải thích Daily và Mentor Duty | Trả lời có căn cứ | Pass |
| TC08 | Hướng dẫn thao tác Daily và Mentor Duty | Trả lời có căn cứ | Pass |
| TC09 | Trả lời khung giờ Daily/XP | Trả lời có căn cứ | Pass |
| TC10 | Giải thích Daily | Trả lời có căn cứ | Pass |
| TC11 | Cung cấp mẫu Daily theo khung nguồn | Trả lời có căn cứ | Pass |
| TC12 | Trả quy trình Mentor Duty | Trả lời có căn cứ | Pass |
| TC13 | Phân biệt người nộp Daily | Trả lời có căn cứ | Pass |
| TC14 | Trả lời Daily và XP | Trả lời có căn cứ | Pass |
| TC15 | Không đoán chủ đề Daily theo ngày | Chuyển Mod | Pass |
| TC16 | Trả cú pháp Daily | Trả lời có căn cứ | Pass |
| TC17 | Trả nơi/cách nộp Daily | Trả lời có căn cứ | Pass |
| TC18 | Trả quy định Workshop/Daily có căn cứ | Trả lời có căn cứ | Pass |
| TC19 | Không đoán ngày bắt đầu áp dụng Daily/XP | Chuyển Mod | Pass |
| TC20 | Hướng dẫn dùng Daily | Trả lời có căn cứ | Pass |

### Tổng hợp

- Hành vi khớp contract tự động: **20/20 = 100%**.
- Trả lời trực tiếp từ nguồn: **14/20 = 70%**.
- Safe routing cho thiếu nguồn, ngoại lệ hoặc mốc chưa xác thực: **6/6 = 100%**.
- Lỗi API / lỗi kiểm tra citation: **0**.
- Bịa deadline hoặc tự phê duyệt ngoại lệ: **0**.

**Kết luận theo quality bar đã chốt:** Đạt — tỷ lệ direct answer là 70% và toàn bộ 6 case cần thận trọng đều chuyển đúng sang @Mod/ticket.

## Thay đổi dựa trên log

Hai lượt chạy chẩn đoán trước Round 2 phát hiện hai lỗi phân loại: TC02 có câu trả lời ticket đúng nhưng gắn nhãn `answer`; TC19 suy diễn “Build Phase” thành mốc áp dụng. Nhóm đã bổ sung guardrail cho yêu cầu gia hạn/mở lại/nộp muộn cá nhân và cho câu hỏi về ngày bắt đầu áp dụng Daily/XP. Sau đó chạy lại toàn bộ 20 case; kết quả ở bảng trên là lượt chính thức.

## Giới hạn cần công khai

Kết quả không chứng minh chatbot biết mọi deadline. Các case Lab02, policy Lab muộn, ngoại lệ commit, chủ đề Daily theo ngày và ngày bắt đầu áp dụng vẫn được chuyển Mod vì chưa có nguồn trực tiếp. Khi có thông báo chính thức mới, nhóm phải nạp nguồn và chạy lại cùng golden set, không đổi quality bar.
