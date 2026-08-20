import 'dotenv/config';
import { prisma } from '../src/config/database';

async function main(){
  const rows = await prisma.$queryRaw`
    SELECT column_name, data_type
    FROM information_schema.columns
    WHERE table_name = 'case_report_status_histories'
    ORDER BY ordinal_position;
  `;
  console.log('Columns for case_report_status_histories:');
  console.table(rows);
}

main().catch(e=>{ console.error(e); process.exit(1); }).finally(()=>prisma.$disconnect());
