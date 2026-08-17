-- AlterTable
ALTER TABLE "customers" ADD COLUMN     "approvedById" TEXT;

-- AddForeignKey
ALTER TABLE "customers" ADD CONSTRAINT "customers_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "staffs"("id") ON DELETE SET NULL ON UPDATE CASCADE;
