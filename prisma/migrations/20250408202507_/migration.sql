-- DropForeignKey
ALTER TABLE "Data" DROP CONSTRAINT "Data_accountId_fkey";

-- DropForeignKey
ALTER TABLE "Data" DROP CONSTRAINT "Data_locationId_fkey";

-- AlterTable
ALTER TABLE "Data" ALTER COLUMN "accountId" DROP NOT NULL,
ALTER COLUMN "locationId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Data" ADD CONSTRAINT "Data_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Data" ADD CONSTRAINT "Data_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;
