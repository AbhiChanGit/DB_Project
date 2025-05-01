/*
  Warnings:

  - The primary key for the `verifying` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Made the column `account_balance` on table `customers` required. This step will fail if there are existing NULL values in that column.
  - Made the column `created_at` on table `users` required. This step will fail if there are existing NULL values in that column.
  - Changed the type of `user_type` on the `users` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Made the column `created_at` on table `verifying` required. This step will fail if there are existing NULL values in that column.

*/

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- CreateEnum
CREATE TYPE "UserType" AS ENUM ('customer', 'staff');

-- AlterTable
ALTER TABLE "customers" ALTER COLUMN "first_name" SET DATA TYPE TEXT,
ALTER COLUMN "last_name" SET DATA TYPE TEXT,
ALTER COLUMN "phone" SET DATA TYPE TEXT,
ALTER COLUMN "account_balance" SET NOT NULL,
ALTER COLUMN "account_balance" SET DATA TYPE DECIMAL(65,30);

-- AlterTable
ALTER TABLE "staff" ALTER COLUMN "first_name" SET DATA TYPE TEXT,
ALTER COLUMN "last_name" SET DATA TYPE TEXT,
ALTER COLUMN "phone" SET DATA TYPE TEXT,
ALTER COLUMN "salary" SET DATA TYPE DECIMAL(65,30),
ALTER COLUMN "job_title" SET DATA TYPE TEXT,
ALTER COLUMN "hire_date" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "username" SET DATA TYPE TEXT,
ALTER COLUMN "email" SET DATA TYPE TEXT,
ALTER COLUMN "created_at" SET NOT NULL,
ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "password_hash" SET DATA TYPE TEXT,
DROP COLUMN "user_type",
ADD COLUMN     "user_type" "UserType" NOT NULL;

-- AlterTable
ALTER TABLE "verifying" DROP CONSTRAINT "verifying_pkey",
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "email" SET DATA TYPE TEXT,
ALTER COLUMN "code" SET DATA TYPE TEXT,
ALTER COLUMN "created_at" SET NOT NULL,
ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMP(3),
ADD CONSTRAINT "verifying_pkey" PRIMARY KEY ("id");
