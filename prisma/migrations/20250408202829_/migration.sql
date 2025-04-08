/*
  Warnings:

  - Made the column `accountId` on table `Data` required. This step will fail if there are existing NULL values in that column.
  - Made the column `locationId` on table `Data` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Data" DROP CONSTRAINT "Data_accountId_fkey";

-- DropForeignKey
ALTER TABLE "Data" DROP CONSTRAINT "Data_locationId_fkey";

-- AlterTable
ALTER TABLE "Data" ALTER COLUMN "accountId" SET NOT NULL,
ALTER COLUMN "locationId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Data" ADD CONSTRAINT "Data_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Data" ADD CONSTRAINT "Data_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
