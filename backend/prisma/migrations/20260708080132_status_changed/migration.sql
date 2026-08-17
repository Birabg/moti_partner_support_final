/*
  Warnings:

  - You are about to drop the column `emailDomain` on the `organizations` table. All the data in the column will be lost.

*/
-- AlterEnum
ALTER TYPE "StaffStatus" ADD VALUE 'REJECTED';

-- DropIndex
DROP INDEX "organizations_emailDomain_key";

-- AlterTable
ALTER TABLE "organizations" DROP COLUMN "emailDomain";
