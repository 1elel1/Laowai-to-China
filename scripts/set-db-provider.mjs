#!/usr/bin/env node
// Prisma requires `provider` in the datasource block to be a string literal — it
// cannot be read from an env var. This rewrites that one line so you can move
// between SQLite (local) and PostgreSQL (production) without hand-editing.
//
//   npm run db:use postgresql
//   npm run db:use sqlite

import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const SUPPORTED = ["sqlite", "postgresql", "mysql"];
const target = process.argv[2];

if (!SUPPORTED.includes(target)) {
  console.error("Usage: npm run db:use <" + SUPPORTED.join("|") + ">");
  process.exit(1);
}

const schemaPath = join(dirname(fileURLToPath(import.meta.url)), "..", "prisma", "schema.prisma");
const schema = readFileSync(schemaPath, "utf8");

// Only touch the provider inside `datasource db { ... }`, never the generator's.
const updated = schema.replace(
  /(datasource\s+db\s*\{[^}]*?provider\s*=\s*)"[^"]+"/,
  '$1"' + target + '"'
);

if (updated === schema) {
  console.log('datasource provider is already "' + target + '" — nothing to do.');
  process.exit(0);
}

writeFileSync(schemaPath, updated);
console.log('datasource provider -> "' + target + '"');
console.log("Next: point DATABASE_URL at that database, then run `npx prisma db push`.");
