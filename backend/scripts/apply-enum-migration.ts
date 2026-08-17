import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import * as PrismaNS from '../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

async function main() {
  const { PrismaClient } = PrismaNS;
  const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });

  const migrationPath = path.join(process.cwd(), 'prisma', 'migrations', '20260814093000_update_case_status_enum', 'migration.sql');
  const sql = fs.readFileSync(migrationPath, 'utf8');

  try {
    await prisma.$executeRawUnsafe(sql);
    console.log('CaseStatus enum migration applied successfully.');
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => { console.error(error); process.exit(1); });