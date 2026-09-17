import { mkdirSync, writeFileSync } from "node:fs";
import { openDatabase } from "../lib/database.mjs";
import { runAllTests } from "../lib/assistant.mjs";

const db = openDatabase();
try {
  const report = await runAllTests(db);
  mkdirSync("test-results", { recursive: true });
  const path = `test-results/cp3-${report.batch_id}.json`;
  writeFileSync(path, JSON.stringify(report, null, 2));
  console.log(JSON.stringify({ ...report, results: undefined, report_path: path }, null, 2));
  process.exitCode = report.failed || report.errors ? 1 : 0;
} finally { db.close(); }
