import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

function createPrisma() {
  const tursoUrl = process.env.TURSO_DATABASE_URL;
  const isRemote = Boolean(tursoUrl && tursoUrl.startsWith("libsql://"));

  const adapter = isRemote
    ? new PrismaLibSql({ url: tursoUrl!, authToken: process.env.TURSO_AUTH_TOKEN })
    : new PrismaLibSql({ url: process.env.DATABASE_URL ?? "file:prisma/dev.db" });

  return new PrismaClient({ adapter } as ConstructorParameters<typeof PrismaClient>[0]);
}

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma ?? createPrisma();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
