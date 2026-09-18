import assert from "node:assert/strict";
import { canonicalAudience, sourceAppliesToProfile } from "../lib/audience.mjs";
import { selectSources } from "../lib/assistant.mjs";

const e402Profile = { practice_class: "3A-E402", theory_class: "3A-D301" };
const sources = [
  {
    id: "GENERAL-SCHEDULE", title: "Lịch chung 3A", audience: "all",
    body: "Quy định chung được áp dụng cho toàn bộ 3A.", published_at: "2026-09-18"
  },
  {
    id: "E402-PRACTICE", title: "Thông báo lớp thực hành E402", audience: "3A-E402",
    body: "Lớp thực hành E402 làm bài thực hành theo lịch đã thông báo.", published_at: "2026-09-18"
  },
  {
    id: "E403-PRACTICE", title: "Thông báo lớp thực hành E403", audience: "3A-E403",
    body: "Lớp thực hành E403 làm bài thực hành theo lịch riêng.", published_at: "2026-09-18"
  },
  {
    id: "D301-DEADLINE-ONE", title: "Deadline chính thức D301: Bài phản hồi", audience: "3A-D301",
    body: "Lớp D301 nộp Bài phản hồi trước 10:00 ngày 20/09/2026.", published_at: "2026-09-18"
  },
  {
    id: "D301-DEADLINE-TWO", title: "Deadline chính thức D301: Bài thực hành", audience: "3A-D301",
    body: "Lớp D301 nộp Bài thực hành trước 23:59 ngày 21/09/2026.", published_at: "2026-09-18"
  }
];

assert.equal(canonicalAudience(" 3a-e402 ; 3A-D301 "), "3A-E402, 3A-D301");
assert.equal(sourceAppliesToProfile("3A-E402", e402Profile), true);
assert.equal(sourceAppliesToProfile("3A-E403", e402Profile), false);
assert.equal(sourceAppliesToProfile("3A", e402Profile), true);

const e402Results = selectSources("thông báo lớp thực hành", sources, e402Profile).map(source => source.id);
assert.deepEqual(e402Results, ["E402-PRACTICE"]);

const e403QuestionFromE402 = selectSources("lịch lớp E403", sources, e402Profile).map(source => source.id);
assert.deepEqual(e403QuestionFromE402, []);

const d301Results = selectSources("hai deadline chính thức của lớp D301", sources, e402Profile).map(source => source.id);
assert.deepEqual(new Set(d301Results), new Set(["D301-DEADLINE-ONE", "D301-DEADLINE-TWO"]));

console.log("Đạt: E402 không nhận nguồn E403; D301 nhận đủ hai deadline chính thức.");
