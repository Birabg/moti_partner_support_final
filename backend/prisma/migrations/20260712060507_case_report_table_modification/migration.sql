/*
  Warnings:

  - You are about to drop the column `assignedPSsupportId` on the `case_report` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "case_report" DROP CONSTRAINT "case_report_assignedPSsupportId_fkey";

-- AlterTable
ALTER TABLE "case_report" DROP COLUMN "assignedPSsupportId",
ADD COLUMN     "assignedSupportId" TEXT;

-- AddForeignKey
ALTER TABLE "case_report" ADD CONSTRAINT "case_report_assignedSupportId_fkey" FOREIGN KEY ("assignedSupportId") REFERENCES "staffs"("id") ON DELETE SET NULL ON UPDATE CASCADE;
