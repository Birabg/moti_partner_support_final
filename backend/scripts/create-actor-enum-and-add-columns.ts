import 'dotenv/config';
import { prisma } from '../src/config/database';

async function main(){
  console.log('Ensuring ActorType enum exists and adding missing columns');

  await prisma.$executeRaw`
    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'actortype') THEN
        CREATE TYPE "ActorType" AS ENUM ('STAFF','CUSTOMER','SYSTEM');
      END IF;
    END $$;
  `;

  await prisma.$executeRaw`
    ALTER TABLE "case_report_status_histories"
      ADD COLUMN IF NOT EXISTS "actorType" "ActorType",
      ADD COLUMN IF NOT EXISTS "actorId" text,
      ADD COLUMN IF NOT EXISTS "oldAgentName" varchar(200),
      ADD COLUMN IF NOT EXISTS "newAgentName" varchar(200),
      ADD COLUMN IF NOT EXISTS "resolutionSnapshot" text;
  `;

  console.log('Done.');
}

main().catch(e=>{ console.error(e); process.exit(1); }).finally(()=>prisma.$disconnect());
