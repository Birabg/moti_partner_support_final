-- AlterTable
ALTER TABLE "staffs" ADD COLUMN     "approvedById" TEXT;

-- AddForeignKey
ALTER TABLE "staffs" ADD CONSTRAINT "staffs_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "staffs"("id") ON DELETE SET NULL ON UPDATE CASCADE;
