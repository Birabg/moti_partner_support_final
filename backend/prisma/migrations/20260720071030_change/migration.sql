-- DropForeignKey
ALTER TABLE "case_report_status_histories" DROP CONSTRAINT "case_report_status_histories_changedById_fkey";

-- AlterTable
ALTER TABLE "case_report_status_histories" ALTER COLUMN "changedById" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "case_report_status_histories" ADD CONSTRAINT "case_report_status_histories_changedById_fkey" FOREIGN KEY ("changedById") REFERENCES "staffs"("id") ON DELETE SET NULL ON UPDATE CASCADE;
