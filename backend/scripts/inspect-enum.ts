import 'dotenv/config';
import * as PrismaNS from '../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

async function main(){
  const { PrismaClient } = PrismaNS;
  const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
  try{
    const rows = await prisma.$queryRaw`SELECT t.typname, e.enumlabel FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid WHERE t.typname ILIKE '%case%' ORDER BY t.typname, e.enumsortorder;`;
    console.log(JSON.stringify(rows, null, 2));
  } finally { await prisma.$disconnect(); }
}
main().catch(e=>{ console.error(e); process.exit(1); });