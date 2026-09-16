# Canvas — Tra cứu hạn và khung giờ nộp có căn cứ

## 1. Pain cụ thể

Học viên AI Thực Chiến K4 trong tuần onboarding cần biết chính xác hạn và khung giờ nộp (lab, daily standup, mentor duty), cùng quy định khi nộp muộn, để nộp đúng hạn và không mất điểm, XP hay điểm danh.

Khi không chắc hạn nộp, học viên tag bot, tự lục thông báo hoặc hỏi Mod. Nhưng trong 15 câu tag bot, 8 câu không nhận được mốc giờ trả lời đúng điều mình hỏi:

- 3 câu bị trả lời lạc chủ đề. Hỏi phạt nộp lab muộn nhưng nhận câu về daily (M75012 → M77155). Hỏi hạn mentor duty nhưng nhận hướng dẫn lệnh /weekly (M99331). Phàn nàn bị báo hết hạn nhưng nhận lại đúng câu mẫu khung giờ (M82163).
- 3 câu bot không có thông tin, trả về 700–860 ký tự chỉ học viên tự đi tìm ở nhiều nơi (M07416, M40677, M89624).
- 1 câu chuyển Mod (M98666), 1 câu lỗi timeout (M57810).

Chỉ 6/15 câu nhận được mốc giờ cụ thể.

Ngoài ra, lời bot và trải nghiệm thực tế không khớp nhau. Bot nhắc lại nhiều lần rằng "nộp muộn vẫn được ghi nhận", nhưng học viên báo bị chặn không cho nộp (M98666, M45316) hoặc nộp muộn thì không được điểm danh (M21463).

Hậu quả đã xảy ra thật: không submit được lab vì muộn 1 phút (M88027), bị chặn nộp daily hoặc mentor duty (M98666, M45316), mất điểm danh (M21463).

## 2. Bằng chứng

Trong Discord pack (12–14/9) có 20 câu hỏi của học viên về hạn hoặc khung giờ nộp. 15 câu tag trực tiếp bot, 5 câu hỏi người trong kênh. Ví dụ: M07416 hỏi hạn nộp Lab02, M75012 hỏi mức trừ điểm khi nộp lab muộn, M99331 hỏi hạn nộp mentor duty, M98666 hỏi giờ mở và đóng daily standup.

Cách đếm: lọc tin của người (`is_bot = False`) chứa đồng thời một từ chỉ thời hạn (hạn, deadline, muộn, trễ, khung giờ, mấy giờ, hết hạn, block, gia hạn, 23h59, 10h…) và một từ chỉ việc nộp (nộp, submit, lab, daily, standup, mentor duty, bài). Kết quả được 28 tin. Loại tay 8 tin không phải câu hỏi về thời hạn (3 thông báo, 2 câu trả lời của người, 3 câu hỏi chủ đề khác), còn 20. Đây là cận dưới, vì bộ lọc bỏ sót vài câu như M40490 và M20574.

Mức độ đau của từng ứng viên sẽ được xác nhận bằng khảo sát ≥20 học viên (đang tiến hành).

## 3. Problem statement + impact

Học viên AI Thực Chiến K4 trong tuần onboarding cần biết chính xác hạn và khung giờ nộp (lab, daily standup, mentor duty), cùng quy định khi nộp muộn, nhưng khi không chắc hạn nộp phải tag bot, tự lục thông báo hoặc hỏi Mod. Trả lời sai về hạn và khung giờ nộp có thể khiến học viên mất điểm, mất XP, bị chặn nộp hoặc mất điểm danh.

Các ứng viên đã cân nhắc (đếm thô theo từ khoá trên 305 tin tag bot, các nhóm có trùng lặp):

| Ứng viên | Số tin |
|---|---:|
| Đề tài / team | ~88 tin |
| XP | ~51 tin |
| Hạn và khung giờ nộp | 20 tin (đếm tay) |
| Điểm danh | ~15 tin |

Hạn nộp không phải chủ đề được hỏi nhiều nhất. Nhóm chọn tra cứu hạn và khung giờ nộp có căn cứ, không xử lý toàn bộ câu hỏi Discord, vì hậu quả khi sai là nặng nhất và đã xảy ra thật: mất điểm, mất XP, bị chặn nộp, mất điểm danh. Trong khi đó, trả lời sai về XP hay đề tài thường chỉ tốn thêm một lượt hỏi. Bài toán này cũng kiểm chứng được bằng thông báo chính thức và hợp nguyên tắc "không có nguồn thì không trả lời".

Ứng viên đề tài/team và XP được giữ lại trong spec §2. Mức độ đau của từng ứng viên sẽ được xác nhận bằng khảo sát ≥20 học viên (đang tiến hành).

## 4. Lát cắt prototype được

Một học viên · hỏi hạn hoặc khung giờ nộp (lab, daily standup, mentor duty) · AI quyết định trong bộ thông báo chính thức có đoạn trả lời đúng câu hỏi này không (có thì trả lời ngắn kèm nguồn, không có hoặc hai nguồn mâu thuẫn thì tag Mod) · học viên nhận mốc giờ có nguồn ngay trong một lượt, thay vì bị trả lời lạc chủ đề hoặc phải tự đi tìm.
