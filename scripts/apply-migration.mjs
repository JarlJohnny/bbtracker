import { createClient } from "@libsql/client";

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

const db = createClient({ url, authToken });

// Check current User columns
const info = await db.execute("PRAGMA table_info('User')");
const columns = info.rows.map(r => r[1]);
console.log("Current User columns:", columns);

if (columns.includes("image") && columns.includes("emailVerified")) {
  console.log("Columns already exist, nothing to do.");
  process.exit(0);
}

console.log("Applying migration...");

// Use the same create-new-table approach as Prisma
const statements = [
  `PRAGMA defer_foreign_keys=ON`,
  `PRAGMA foreign_keys=OFF`,
  `CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT,
    "name" TEXT NOT NULL,
    "image" TEXT,
    "emailVerified" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
  )`,
  `INSERT INTO "new_User" ("createdAt", "email", "id", "name", "passwordHash", "updatedAt")
   SELECT "createdAt", "email", "id", "name", "passwordHash", "updatedAt" FROM "User"`,
  `DROP TABLE "User"`,
  `ALTER TABLE "new_User" RENAME TO "User"`,
  `CREATE UNIQUE INDEX "User_email_key" ON "User"("email")`,
  `PRAGMA foreign_keys=ON`,
  `PRAGMA defer_foreign_keys=OFF`,
];

for (const stmt of statements) {
  console.log("→", stmt.slice(0, 70).replace(/\s+/g, " "));
  await db.execute(stmt);
}

console.log("Done!");
