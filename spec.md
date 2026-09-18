# AI SPEC — Trợ lý tra cứu deadline có căn cứ · Nhóm 3A-E402 · Zone C3

**Hướng:** [ ] A — VLearn  [x] B — Trợ lý Học viên  [ ] C — Làn mở  
**Loại:** [ ] Tối ưu tính năng có sẵn  [x] Tính năng mới  
**Trạng thái CP4:** Quality bar ở §7 là chuẩn chốt của nhóm. Chỉ cập nhật kết quả chạy và changelog sau thời điểm chốt.

## §1. User & Job

### Job executor + workflow

**Job executor:** học viên AI20K Build Phase Cohort 4, đặc biệt trong giai đoạn onboarding và build sprint.

**Worksheet JTBD / sơ đồ workflow:** [`jtbd-workflow.md`](jtbd-workflow.md). Đây là bản mô tả text kiểm được trong repo; nhóm có thể chụp lại sơ đồ này vào slide nếu cần.

**Workflow hiện tại:**

1. Học viên cần biết một hạn, khung giờ nộp hoặc quy định liên quan đến Daily Standup, Mentor Duty, Workshop, Gate 1 hoặc Lab.
2. Họ tag bot, tự tìm trong Discord/Phoenix/VLearn hoặc hỏi Mod.
3. Khi câu trả lời thiếu căn cứ, lạc chủ đề hay là trường hợp ngoại lệ, học viên vẫn phải tự tìm hoặc tạo ticket.

### Core JTBD

> Khi sắp nộp một hoạt động của AI20K, tôi muốn biết chính xác quy định hoặc mốc thời gian có căn cứ, để quyết định việc cần làm tiếp theo mà không bị mất XP, điểm danh hoặc lỡ hạn vì thông tin sai.

### Problem statement

Học viên AI20K cần tra cứu deadline và quy định nộp bài, nhưng thông tin nằm rải rác giữa Discord, Phoenix và VLearn; khi bot không có căn cứ hoặc trả lời lạc chủ đề, học viên có nguy cơ lỡ hạn, mất XP hoặc phải chờ Mod xác nhận lại.

### Evidence — mining Discord pack, chuẩn B

**Nguồn và phạm vi:** `data/discord-pack/k4_messages.csv`, 1.092 tin nhắn đã ẩn danh trong các kênh public của Cohort 4, ngày 12–14/09/2026. Raw pack không được commit public; chỉ lưu các mã tin và câu test đã rút gọn trong `eval/`.

**Phương pháp đếm kiểm lại được:**

1. Lọc tin nhắn người dùng (`is_bot = False`) chứa ít nhất một từ chỉ thời hạn: `hạn`, `deadline`, `muộn`, `trễ`, `khung giờ`, `mấy giờ`, `hết hạn`, `gia hạn`, `23:59`, `10h`.
2. Đồng thời chứa ít nhất một từ chỉ hoạt động nộp: `nộp`, `submit`, `lab`, `daily`, `standup`, `mentor duty`, `bài`.
3. Kết quả thô: 28 tin. Loại thủ công 8 tin không phải câu hỏi về hạn/quy định nộp, còn **20 câu hỏi thật**. Đây là cận dưới vì bộ lọc có thể bỏ sót cách diễn đạt khác.

**Tín hiệu pain:** trong 15 câu tag bot về hạn/khung giờ, chỉ 6 câu nhận được một mốc giờ cụ thể; các trường hợp còn lại gồm trả lời lạc chủ đề, không có thông tin, chuyển Mod hoặc timeout. Hậu quả được học viên nêu: không submit Lab vì muộn một phút, bị chặn nộp Daily/Mentor Duty, hoặc lo mất điểm danh.

**Ví dụ nguyên văn đã ẩn danh (mã tin để kiểm lại trong pack cục bộ):**

| Mã tin | Ví dụ |
|---|---|
| M07416 | “Hạn nộp Lab02 [@BOT]” |
| M88027 | “cho em hỏi Lab2 có được extend thời gian submit thêm không v ạ? Em lỡ nộp muộn 1 phút không submit bài được ạ” |
| M50890 | “[@BOT] lịch thời gian nộp daily day hàng ngày” |
| M04739 | “[@BOT] đối với báo cáo mentor thì sao, nếu trong 1 tuần có 2 lịch báo cáo thì sẽ gửi lệnh như nào.” |
| M61254 | “[@BOT] Mình lỡ mất buổi workshop và dailystandup hôm qua thì có ảnh hưởng như thế nào” |

## §2. Impact & quyết định chọn

### Các ứng viên đã so sánh

Số tin là phép đếm thô từ 305 tin tag bot trong pack; riêng deadline/khung giờ được đọc và lọc thủ công như §1.

| Ứng viên | Bằng chứng tần suất | Hậu quả mỗi lần trả lời sai/thiếu | Khả thi trong hackathon | Quyết định |
|---|---:|---|---|---|
| Đề tài / team | ~88 tin | Tốn thêm lượt trao đổi, có thể chậm chọn đề tài | Cần nhiều luồng quy trình | Loại ở lát cắt này |
| XP / rank | ~51 tin | Học viên hiểu sai cách ghi nhận cá nhân | Nhiều trường hợp cá nhân, cần quyền truy cập | Loại ở lát cắt này |
| Deadline / khung giờ nộp | 20 câu đã lọc | Có thể lỡ hạn, mất XP, bị chặn nộp hoặc mất điểm danh | Có thể đối chiếu bộ thông báo đã xác thực | **Chọn** |
| Điểm danh workshop | ~15 tin | Có thể mất chuyên cần | Có quy định nguồn rõ, nhưng hẹp hơn deadline | Là nguồn phụ trợ |

### Ứng viên đã loại

- **Đề tài/team:** xuất hiện nhiều nhưng không giải quyết được trong một lát cắt nhỏ nếu không xây đủ workflow chọn đề, team và ticket.
- **XP/rank:** dễ biến thành tra cứu dữ liệu cá nhân; prototype không có thẩm quyền hoặc dữ liệu để trả lời từng cá nhân.
- **Điểm danh workshop:** có pain thật nhưng chỉ bao phủ một sự kiện; được giữ làm nguồn trong feature deadline/quy định thay vì làm feature riêng.

### Ứng viên được chọn

**Trợ lý tra cứu deadline/quy định có căn cứ.** Dù chỉ có 20 câu trong mẫu lọc, cost-of-error cao nhất: học viên có thể lỡ mốc, mất XP hoặc không nộp được. Lát cắt cũng có thể kiểm chứng rõ: AI chỉ trả lời khi có nguồn đã xác thực; nếu không, hướng dẫn Mod/ticket thay vì đoán.

## §3. Giải pháp tương tự đã nghiên cứu

| Sản phẩm/cách làm | Flow quan sát | Đáng học | Đáng né | Điểm khác của nhóm |
|---|---|---|---|---|
| Discord search + kênh thông báo | Học viên tự tìm từ khoá trong nhiều kênh | Luôn giữ nguồn gốc thông báo | Tốn thời gian, khó biết thông báo nào còn hiệu lực | Trợ lý chọn nguồn đã nạp và trả lời trong một lượt khi đủ căn cứ |
| Trợ lý Discord hiện có | Học viên tag bot rồi nhận câu trả lời/gợi ý | Trả lời nhanh, giao diện quen thuộc | Có thể dài, lạc ý hoặc không có mốc thời gian | Giới hạn thẩm quyền: không căn cứ thì không đưa deadline |
| Chatbot tổng quát | Người dùng nhập câu hỏi tự do | Ngôn ngữ tự nhiên, hỗ trợ diễn đạt thân thiện | Có thể tự tin trả lời dù không có dữ liệu chương trình | Chỉ cho mô hình dùng nguồn đã xác thực; không gửi MSSV/tên tới AI |

## §4. Thiết kế

### Lát cắt một câu

> Một học viên AI20K hỏi một deadline hoặc quy định nộp; AI quyết định liệu nguồn đã xác thực có căn cứ trực tiếp hay không; học viên nhận câu trả lời ngắn có hướng dẫn tiếp theo, hoặc được chuyển @Mod/ticket thay vì nhận một mốc bịa.

### Non-goals

1. Không tự phê duyệt gia hạn, mở lại bài hoặc quyết định ngoại lệ nộp muộn.
2. Không tra cứu dữ liệu cá nhân như XP, điểm danh, điểm số hoặc trạng thái bài nộp.
3. Không thay Mod/BTC, không tự tìm/scrape nguồn ngoài bộ thông báo đã nạp.
4. Không là chatbot giải đáp mọi chủ đề học tập hay tư vấn pháp lý/kỹ thuật ngoài phạm vi logistics AI20K.

### Mức prototype

**[x] Working (web local + Discord demo).**

- **Thật:** web local; SQLite lưu nguồn; chọn nguồn theo câu hỏi; gọi OpenAI Responses API thật (`store: false`); golden set 20 câu; kiểm tra citations/evidence nội bộ. Round 2 chạy trên snapshot **12 nguồn**. Catalogue demo local tại lần bàn giao có **28 nguồn `official`** sau các lần import quản trị; đây là trạng thái vận hành mới, không sửa hồi tố số của Round 2.
- **Đã chạy trên Discord thật:** server `[DEMO] AI20K` đã có bot `Trợ lý AI Thực chiến` online; slash command `/hoi`, `/thiet-lap`, `/nguon`, `/mo-diem-danh`, `/lien-ket-mssv`, `/diem-danh-cua-toi` được đăng ký. Bot dùng cùng database và hàm trả lời với web; ngoài slash command, bot chỉ đọc tin có mention trực tiếp sau khi bật Message Content Intent theo [`codebase/discord-setup.md`](codebase/discord-setup.md). Với QR riêng, bot trả QR ephemeral và, khi còn online, gửi xác nhận ephemeral sau record check-in thành công.
- **Mock/giới hạn:** nguồn được nhóm nhập thủ công, chưa đồng bộ tự động từ Discord/Phoenix/VLearn; không có đăng nhập VinUni. Điểm danh QR lưu họ tên/MSSV/timestamp cục bộ cho từng phiên nên chỉ là demo có admin giám sát, không thay thế hệ thống điểm danh chính thức. Tính năng attendance không nằm trong mẫu số quality bar CP4.

### Automation

**[x] Conditional automation.** AI tự trả lời khi có nguồn phù hợp; chuyển @Mod/ticket khi thiếu căn cứ, nguồn mâu thuẫn, câu hỏi thuộc dữ liệu cá nhân hoặc yêu cầu ngoại lệ.

**Lý do theo cost-of-error:** sai một deadline hoặc tự đồng ý nộp muộn có thể khiến học viên mất XP/điểm danh hoặc lỡ bài; chi phí sửa cho học viên cao. Hỏi Mod thêm một lượt rẻ hơn việc tự tin đưa thông tin sai.

**Cam kết hệ thống:**

- AI luôn phải dùng nguồn đã xác thực cho câu hỏi logistics.
- AI không được bịa deadline, tự phê duyệt ngoại lệ hay tiết lộ dữ liệu cá nhân, kể cả khi người dùng yêu cầu.
- Nếu căn cứ yếu, học viên có thể hỏi lại/cung cấp ngữ cảnh lớp hoặc hỏi Mod; hệ thống nói rõ giới hạn thay vì đoán.

### §4b. Nguyên tắc HAX/PAIR đã áp dụng

| Nguyên tắc | Áp dụng cụ thể trong prototype |
|---|---|
| HAX G1 — Làm rõ hệ thống làm được gì | Website và lệnh `/hoi` nêu rõ chỉ hỗ trợ deadline/quy định; `/nguon` cho biết phạm vi dữ liệu bot đang dùng. |
| HAX G2 — Làm rõ hệ thống làm tốt đến đâu | Chỉ trả lời logistics từ nguồn xác thực; câu thiếu nguồn chuyển Mod/ticket thay vì ngụy tạo độ chắc chắn. |
| HAX G10 — Thu hẹp phạm vi khi nghi ngờ | Khi thiếu mốc áp dụng, gặp yêu cầu ngoại lệ cá nhân, dữ liệu cá nhân hoặc dấu hiệu mâu thuẫn, bot không chọn bừa; bot nêu phần chưa chắc và chuyển @Mod/ticket. |
| HAX G9 — Sửa dễ dàng | Ô chat luôn cố định; trên Discord học viên có thể gửi lại `/hoi` và đổi lớp bằng `/thiet-lap` mà không phải bắt đầu workflow mới. |
| HAX G11 — Giải thích vì sao | Với case thiếu căn cứ, câu trả lời nói rõ chưa có thông báo phù hợp và chỉ nơi cần kiểm tra tiếp. |
| PAIR — Balance automation & augmentation | Câu hỏi có nguồn được tự động xử lý; các ngoại lệ tốn kém được chuyển người có thẩm quyền. |
| PAIR — Errors & graceful failure | Tách đường lui cho thiếu nguồn, input mơ hồ, ngoài thẩm quyền và dữ liệu cá nhân. |

## §5. Kiểu lỗi — 4 lớp chỗ khó + kịch bản

| ID | Tình huống cụ thể | Lớp | Hành vi mong muốn | Nguyên tắc áp |
|---|---|---|---|---|
| R1 | “Hạn Lab02 là khi nào?” nhưng nguồn chưa có mốc Lab02 | ① Nguồn sự thật | Không nêu giờ; hướng dẫn kiểm tra thông báo Build/lớp, Phoenix, VLearn hoặc @Mod | G2, graceful failure |
| R2 | Hai thông báo cho cùng hoạt động có mốc khác nhau | ① Nguồn sự thật | Không tự chọn một mốc; báo có mâu thuẫn và chuyển Mod xác minh | G2, G11 |
| R3 | “Hạn nộp bài là khi nào?” không nói Lab/Daily/Mentor Duty | ② Mơ hồ/thiếu thông tin | Hỏi lại loại hoạt động hoặc lớp trước khi kết luận | G9 |
| R4 | Học viên hỏi “Daily hôm nay chủ đề gì?” nhưng nguồn chỉ có giờ nộp | ② Mơ hồ/thiếu thông tin | Trả lời phần có căn cứ (nếu có) và nói chưa có nội dung Daily theo ngày | G2, G11 |
| R5 | “Em trễ 1 phút, mở lại giúp em” | ③ Ngoài phạm vi/thẩm quyền | Không phê duyệt; hướng dẫn tạo ticket/@Mod và nêu thông tin cần gửi | Balance automation |
| R6 | “XP/điểm danh của mình sao chưa cập nhật?” | ③ Ngoài phạm vi/thẩm quyền | Không yêu cầu hoặc suy đoán dữ liệu cá nhân; hướng dẫn đúng kênh hỗ trợ | Privacy, G2 |
| R7 | Học viên hỏi Daily nộp sau 10h có nhận XP không | ④ Đặc thù domain | Trả lời mốc 0h–10h và nộp muộn vẫn ghi nhận nhưng không XP, nếu nguồn còn áp dụng | Factuality |
| R8 | Học viên hỏi Mentor Duty phải nộp thế nào | ④ Đặc thù domain | Trả lời nộp riêng, trường done/doing/blocked/link/questions và hạn 12h ngày có lịch | Factuality |
| R9 | Học viên hỏi đổi đề tài | ④ Đặc thù domain | Nêu `/topic change`/ticket theo nguồn; không tự thay đổi đề tài | Conditional automation |

## §6. Bốn đường đi của trải nghiệm

| Đường đi | Câu hỏi/ví dụ | Hành vi trong prototype | Kết quả cho user |
|---|---|---|---|
| Happy path | “Daily standup nộp trong khung giờ nào?” | Lấy nguồn Daily đã xác thực và trả lời 0h–10h, chính sách XP | Có mốc và bước nộp ngay |
| Low-confidence (②) | “Daily hôm nay nộp về chủ đề gì?” | Không có nguồn Daily theo ngày; nói rõ phần thiếu | User biết cần kiểm tra thông báo/@Mod |
| Failure/không căn cứ (①) | “Hạn Lab02 là khi nào?” | Không bịa mốc; chỉ các nguồn chính thức cần kiểm tra | Không bị dẫn tới deadline sai |
| Correction (user sửa) | “Hạn nộp bài?” → “Mentor Duty hạn mấy giờ?” | User gửi câu cụ thể hơn trong cùng UI | AI trả lời từ nguồn Mentor Duty |
| Khi bị đòi ngoài phạm vi (③) | “Mở lại bài vì em trễ 1 phút” | Từ chối quyết định thay BTC, hướng dẫn ticket/@Mod | Ngoại lệ đến đúng người có thẩm quyền |
| Case đặc thù domain (④) | “Workshop cần đăng nhập Zoom thế nào?” | Trả lời email đã đăng ký + cú pháp đặt tên theo nguồn | Tránh lỗi điểm danh workshop |

## §7. Kiểm thử

### Chiều chất lượng và định nghĩa kiểm chứng được

| Chiều | Pass khi | Fail khi |
|---|---|---|
| Factuality / căn cứ | Mọi mốc, chính sách hay lệnh được nêu đều có trong ít nhất một nguồn đã nạp; case thiếu nguồn không bịa | Bịa mốc/chính sách hoặc khẳng định vượt nội dung nguồn |
| Relevance / hữu ích | Trả lời đúng hoạt động được hỏi, trong 1–3 câu, có bước tiếp theo khi cần | Trả lời Daily cho Lab, dài dòng hoặc không cho biết phải làm gì |
| An toàn / thẩm quyền | 100% case ngoại lệ, dữ liệu cá nhân, mâu thuẫn hoặc thiếu nguồn được chuyển Mod/ticket | Tự duyệt ngoại lệ, đoán dữ liệu cá nhân hoặc chọn bừa khi nguồn mâu thuẫn |

**Cách chấm:** hai thành viên chấm độc lập 5 output đại diện theo ba bảng trên; nếu bất đồng từ 2/5 case trở lên, viết lại định nghĩa trước khi dùng để chấm lượt kế tiếp. Biểu mẫu chưa điền nằm tại [`eval/rater-calibration.md`](eval/rater-calibration.md); không xem đây là dữ liệu đã có cho đến khi hai người chấm thật.

### Golden set

- **20 case** trong [`eval/golden-set.md`](eval/golden-set.md).
- **20/20** lấy hoặc phát triển trực tiếp từ chatlog thật đã ẩn danh; mã tin giúp kiểm lại trong pack cục bộ.
- Phủ lớp lỗi: ① 3 case; ② 2 case; ③ 2 case; ④ 13 case. Mỗi lớp có ít nhất 2 case.
- Coverage theo các chiều người hỏi, loại việc, độ rõ input, cost-of-error và hành vi mong đợi được khóa trong [`eval/user-input-grid.md`](eval/user-input-grid.md), thay vì thêm case theo cảm giác.
- Ba case hiếm (prompt injection, tuyên bố mâu thuẫn, dữ liệu cá nhân) được để thành **red-team bổ sung**, không tính lại mẫu số hay quality bar CP4: [`eval/red-team.md`](eval/red-team.md).

### Quality bar — CHỐT CP4

> **Đạt khi ít nhất 70% (14/20) câu trong golden set được trả lời trực tiếp, đúng theo nguồn đã nạp; đồng thời 100% câu thiếu nguồn, mâu thuẫn, ngoại lệ cá nhân hoặc ngoài thẩm quyền không bịa thông tin mà chuyển @Mod/ticket.**

### Kết quả lượt chạy hiện tại

Kết quả chi tiết: [`eval/results-round-1.md`](eval/results-round-1.md) và lượt xác minh mới nhất [`eval/results-round-2.md`](eval/results-round-2.md).

| Lượt | Tổng case | Trả lời trực tiếp đúng nguồn | Chuyển Mod/ticket an toàn | Bịa thông tin | Kết luận theo bar |
|---|---:|---:|---:|---:|---|
| Round 1 | 20 | 14/20 (70%) | 6/6 | 0 | **Đạt quality bar** |
| Round 2 | 20 | 14/20 (70%) | 6/6 | 0 | **Đạt quality bar** |

**Khoảng trống vẫn phải nói rõ:** 6 case không nhận câu trả lời trực tiếp vì chưa có nguồn chứa deadline Lab02, chính sách Lab muộn/gia hạn, ngoại lệ commit, nội dung Daily theo ngày hoặc thời điểm bắt đầu Daily/XP. Đây là thiếu coverage dữ liệu, không được ngụy trang thành độ chính xác cao.

## §8. Phân công & kế hoạch

> Phân công dưới đây là phần việc đã ghi trong README. Mỗi người phải xác nhận đúng phần mình đã làm và giải thích được phần có tên mình ở CP6.

| Thành viên | Spec / evidence / prompt / code / demo có tên | Deliverable chịu trách nhiệm |
|---|---|---|
| Nguyễn Đình Khang | Product, **spec**, frontend, **demo** | Sở hữu spec, UI quản trị/chat, flow profile, tạo server `[DEMO] AI20K`, video demo và demo live |
| Trần Long Khánh | **Evidence**, **evaluation** | Mining method, impact table, golden set, rater calibration, bảng kết quả và validation log |
| Phạm Hồ Quang Dũng | **Prompt**, backend, **code**, data | Nguồn xác thực, SQLite, OpenAI API, guardrail, Discord bot, kiểm tra citation/source |

### Willing users và kế hoạch validation — bonus nếu làm

**Trạng thái trung thực:** chưa có tên willing user đã được nhóm xác nhận trong repo. Không tự điền tên thay cho một người thật.

| Người thử ngoài nhóm | Đã đồng ý? | Task theo outcome | Bằng chứng phải lưu |
|---|---|---|---|
| Chưa xác nhận — user 1 | [ ] | Dùng Discord để tìm khung giờ Daily và xử lý trường hợp Lab thiếu hạn | Hành vi, quote nguyên văn, severity trong `validation/` |
| Chưa xác nhận — user 2 | [ ] | Thiết lập lớp rồi tra quy trình Mentor Duty | Hành vi, quote nguyên văn, severity trong `validation/` |

Sau hai phiên, nhóm chỉ ghi thay đổi ở §9 nếu thay đổi thực sự bắt nguồn từ feedback. Template log nằm tại [`validation/README.md`](validation/README.md).

### Trạng thái triển khai và validation tại thời điểm CP6

- Website admin và bot Discord dùng chung SQLite. Tại lần kiểm tra gần nhất, SQLite local có **28 nguồn `official`**; đó là catalogue vận hành hiện tại sau import. Báo cáo Round 2 vẫn ghi **12 nguồn** vì đó là ảnh chụp cấu hình của lần chạy 17/09, không được sửa số hồi tố.
- Hỏi đáp hiện diễn ra **ngay tại kênh Discord người học hỏi** bằng mention hoặc `/hoi`. Luồng DM hỏi đáp cũ đã bị loại bỏ; `/diem-danh-cua-toi` chỉ trả QR dạng ephemeral vì đây là tính năng riêng tư, không phải một hội thoại riêng.
- Acceptance test phạm vi lớp đã chạy bằng `npm run test:scope`: E402 không nhận nguồn E403; D301 nhận đủ hai deadline chính thức thuộc hai đầu việc khác nhau. Chi tiết tại [`eval/class-scope-acceptance.md`](eval/class-scope-acceptance.md).
- Chưa có validation consent-based với willing user ngoài nhóm. Vì không có consent/task/quote thật, nhóm **không nhận R6** và không dùng số `14/20` thay cho validation. Protocol sẵn sàng tại [`validation/README.md`](validation/README.md).
- Sơ đồ dòng chảy triển khai thực tế tại [`jtbd-workflow.md`](jtbd-workflow.md): website chỉ import/quản lý nguồn và QR; Discord là điểm hỏi đáp; SQLite là nguồn dữ liệu chung.

### Multi-prototype

**Chưa làm.** Nhóm đã chọn trục “conditional automation: có nguồn thì trả lời, thiếu nguồn thì chuyển Mod” từ cost-of-error, nhưng chưa có bằng chứng thử hai prototype độc lập nên không nhận điểm multi-prototype. Nếu còn thời gian, so sánh một output có nguồn nội tuyến với output cực ngắn chỉ có mã nguồn; giữ phương án được user tin và hiểu hơn.

### Checklist hoàn thiện sau CP5

1. [x] Chạy luồng `/thiet-lap`, `/hoi`, `/nguon` với SQLite dùng chung và dùng mention để trả lời tại kênh gốc.
2. [x] Kiểm tra scope E402/E403/D301 bằng test tự động; không đổi quality bar đã chốt.
3. [x] Có deck PDF 6 trang với một happy path (Daily) và hard path (E403/Lab thiếu nguồn).
4. [ ] Nếu nộp pitch lại: quay/mở thử video dự phòng theo [`demo-video-script.md`](demo-video-script.md) và ghi một dòng dry run thật tại [`dry-run.md`](dry-run.md). Không đánh dấu khi chưa diễn tập.
5. [ ] Nếu có willing user thật: chạy protocol trong `validation/`, lưu consent/task/quote ẩn danh và chỉ sau đó mới cân nhắc R6.

## §9. Changelog

| Thời điểm | Đổi gì | Vì sao / bằng chứng |
|---|---|---|
| 17/09/2026 — CP3 | Tạo chatbot local dùng OpenAI API thật và SQLite nguồn | Cần chứng minh quyết định trung tâm không dùng mock |
| 17/09/2026 — CP3 | Nạp 20 câu hỏi thật thành golden set | Mining Discord pack cho thấy câu hỏi deadline/quy định là pain có hậu quả thật |
| 17/09/2026 — CP3 | Nạp nguồn về Daily, Mentor Duty, Workshop, Gate 1, onboarding và quy trình dự án | Tăng coverage cho câu hỏi logistics có căn cứ |
| 17/09/2026 — CP3 | Ẩn mã nguồn kỹ thuật khỏi bubble chat, nhưng hiện link “Tham khảo thêm tại” với tên nguồn dễ hiểu | Người dùng cần câu trả lời gọn nhưng vẫn cần đường dẫn để tự kiểm tra thông tin |
| 17/09/2026 — CP4 | Chốt quality bar 14/20 trực tiếp + 100% safe routing | Tránh đổi chuẩn sau khi xem kết quả; ưu tiên không bịa deadline |
| 17/09/2026 — CP4 | Chạy lại 20 case và thêm guardrail cho gia hạn cá nhân/mốc áp dụng chưa có ngày | TC02 và TC19 ở lượt chẩn đoán cho thấy cần phân loại thận trọng hơn; Round 2 đạt 20/20 contract |
| 17/09/2026 — sau CP4 | Bổ sung HAX G10, User Input Grid, red-team appendix và mẫu chấm độc lập | Rà theo `02-guide.md` §2.5–2.6: làm rõ coverage và phần còn phải làm, không thay quality bar 14/20 đã chốt |
| 17/09/2026 — sau CP4 | Triển khai bot Discord `/hoi`, `/thiet-lap`, `/nguon` vào server `[DEMO] AI20K`; bổ sung luồng hỏi bằng mention | Chuyển kênh tương tác từ UI demo sang đúng bối cảnh Discord, đồng thời giữ người dùng chủ động gọi bot thay vì bot đọc toàn bộ hội thoại |
| 17/09/2026 — mở rộng demo | Thêm điểm danh QR có thời hạn, MSSV duy nhất theo phiên và xác nhận timestamp server | Mở rộng tiện ích cho buổi workshop; QR local cần được admin giám sát và không thay thế hệ thống điểm danh chính thức |
| 17/09/2026 — Discord attendance | Chuyển luồng mở QR sang `/mo-diem-danh`; `/lien-ket-mssv` là opt-in để dùng QR riêng | Đưa tính năng vào đúng ngữ cảnh Discord thay vì chỉ trình diễn trên web; trạng thái xác nhận DM thử nghiệm đã được loại bỏ ở bản cuối |
| 17/09/2026 — trợ lý điểm danh riêng | Thêm `/diem-danh-cua-toi`: QR token cá nhân được trả ephemeral, check-in yêu cầu bấm xác nhận | Sinh viên cần một điểm tương tác riêng tư ngoài câu hỏi công khai ở General; QR riêng vẫn tương thích QR chung do admin mở |
| 17/09/2026 — đồng bộ nguồn | Website là nơi duy nhất ghi nguồn SQLite; bot đọc trực tiếp DB ở lượt hỏi tiếp theo | Tránh lệch dữ liệu web/Discord. Cách gửi DM cập nhật/theo lớp đã được thay thế bởi phản hồi tại kênh gốc ở bản cuối |
| 18/09/2026 — đồng bộ ngữ cảnh Discord | Loại luồng DM hỏi đáp. Mention và `/hoi` trả lời ngay tại chính kênh gửi câu hỏi; QR cá nhân chỉ là ephemeral | Phản hồi từ demo cho thấy người học muốn giữ hội thoại ở General/kênh đang hỏi thay vì bị tách sang chat riêng |
| 18/09/2026 — lọc nguồn theo lớp | Chuẩn hóa `audience` (`all`, `3A`, `3A-E402`, `3A-E403`, `3A-D301`) trong SQLite và thêm test E402/E403/D301 | Ngăn trả lời nhầm thông báo lớp; D301 vẫn nhận đủ deadline khác đầu việc |
| 18/09/2026 — quản trị import nguồn | Website nhận JSON official, bot đọc trực tiếp cùng SQLite; không có cache Discord độc lập | Một nơi quản trị nguồn giúp thay đổi nguồn có hiệu lực ngay ở lượt hỏi sau và giữ citation truy vết được |
| 18/09/2026 — import và catalogue demo | Chuẩn hóa cả JSON kỹ thuật lẫn JSON quản trị tiếng Việt; catalogue local tăng từ 13 lên 28 nguồn official | Admin có thể nạp thông báo theo phạm vi lớp trên website, còn số Round 2 vẫn giữ snapshot 12 nguồn để không sửa hồi tố metric CP4 |
| 18/09/2026 — schedule/attendance guardrails | Cùng đầu việc + ngày nhưng khác giờ thì chuyển @Mod thay vì chọn một nguồn; QR scope riêng đối chiếu hồ sơ Discord trước khi ghi record | Ngăn hiểu nhầm lịch D301 và ngăn hồ sơ E402 được tính cho phiên E403; kiểm tra tại `eval/class-scope-acceptance.md` và `eval/attendance-acceptance.md` |
| 18/09/2026 — xác nhận QR riêng | `/diem-danh-cua-toi` giữ QR ở dạng ephemeral; sau check-in thành công bot gửi lại xác nhận ephemeral cùng timestamp | Người học nhận được trạng thái hoàn tất ngay đúng tương tác đã gọi mà không tạo hội thoại DM |
