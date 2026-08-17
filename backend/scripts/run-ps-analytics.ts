import 'dotenv/config';
import { PrismaClient } from '../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

async function main(){
  const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
  try{
    const staffData = await prisma.staff.findMany({
      where: { status: 'ACTIVE' },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        isPSsupport: true,
        assignedCases: { select: { id: true, status: true, feedback: { select: { rating: true } } } }
      }
    });

    console.log('staff count:', staffData.length);
    for(const s of staffData){
      console.log(s.id, s.firstName, s.isPSsupport, 'assignedCases:', (s.assignedCases || []).length);
    }
  }catch(e){ console.error(e); }
  finally{ await prisma.$disconnect(); }
}

main();