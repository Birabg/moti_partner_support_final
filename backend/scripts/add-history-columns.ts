import 'dotenv/config';
import { prisma } from '../src/config/database';

async function main(){
  console.log('Altering case_report_status_histories to add missing columns if needed');

  await prisma.$executeRaw`
    ALTER TABLE "case_report_status_histories"
      ADD COLUMN IF NOT EXISTS "actorType" "ActorType",
      ADD COLUMN IF NOT EXISTS "actorId" text,
      ADD COLUMN IF NOT EXISTS "oldAgentName" varchar(200),
      ADD COLUMN IF NOT EXISTS "newAgentName" varchar(200),
      ADD COLUMN IF NOT EXISTS "resolutionSnapshot" text;
  `;

  console.log('Alter complete.');
}

main().catch(e=>{ console.error(e); process.exit(1); }).finally(()=>prisma.$disconnect());
