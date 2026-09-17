import { openDatabase, databasePath, listTestCases } from "../lib/database.mjs";

const db = openDatabase();
console.log(JSON.stringify({ database: databasePath, test_cases: listTestCases(db).length, sources: db.prepare("SELECT count(*) AS count FROM sources WHERE official = 1").get().count }, null, 2));
db.close();
