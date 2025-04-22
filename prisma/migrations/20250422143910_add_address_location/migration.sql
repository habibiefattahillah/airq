/*
  Warnings:

  - You are about to drop the `WaterQualityEntry` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "Location" ADD COLUMN     "address" TEXT,
ALTER COLUMN "country" DROP NOT NULL,
ALTER COLUMN "state" DROP NOT NULL;

-- DropTable
DROP TABLE "WaterQualityEntry";
