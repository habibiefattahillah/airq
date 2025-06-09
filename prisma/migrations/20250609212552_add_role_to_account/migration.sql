-- CreateEnum
CREATE TYPE "Role" AS ENUM ('superadmin', 'guest');

-- AlterTable
ALTER TABLE "Account" ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'guest';
