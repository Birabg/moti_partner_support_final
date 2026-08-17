require('dotenv').config({ path: './.env' });
const { PrismaClient } = require('./generated/prisma/client');
const prisma = new PrismaClient();

(async () => {
  try {
    const rows = await prisma.$queryRawUnsafe(
      'SELECT id, recipient_id, recipient_type, message, is_read, created_at FROM notifications ORDER BY created_at DESC LIMIT 10;'
    );
    console.log(JSON.stringify(rows, null, 2));
  } catch (error) {
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
})();
