/*
  Warnings:

  - You are about to drop the column `resolvedAt` on the `case_report` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "case_report" DROP COLUMN "resolvedAt";

-- AlterTable
ALTER TABLE "staffs" ALTER COLUMN "isPSsupport" SET DEFAULT false;
