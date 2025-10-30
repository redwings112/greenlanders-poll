// server/db.js
import { Low } from "lowdb";
import { JSONFile } from "lowdb/node";
import { join } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = __filename.replace(/\/db\.js$/, "");

const file = join(__dirname, "db.json");
const adapter = new JSONFile(file);
const db = new Low(adapter);

await db.read();
db.data ||= { users: [], nonces: {}, rewards: [] };

export default db;
