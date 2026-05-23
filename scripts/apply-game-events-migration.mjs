import { createClient } from "@libsql/client";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const sql = readFileSync(
  join(__dirname, "../prisma/migrations/20260522000003_add_game_events/migration.sql"),
  "utf-8"
);

const statements = sql.split(";").map((s) => s.trim()).filter(Boolean);

async function applyTo(client, label) {
  for (const stmt of statements) {
    try {
      await client.execute(stmt);
    } catch (e) {
      if (e.message?.includes("duplicate column") || e.message?.includes("already exists")) {
        console.log(`  [skip] Already applied: ${stmt.slice(0, 60)}...`);
      } else {
        throw e;
      }
    }
  }
  console.log(`Applied to ${label}`);
}

const local = createClient({ url: "file:./prisma/dev.db" });
await applyTo(local, "local SQLite");

const turso = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});
await applyTo(turso, "Turso");
