/*
  Warnings:

  - Changed the type of `address_type` on the `addresses` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `user_type` on the `users` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- ← add this so re-running won’t error out
DROP TYPE IF EXISTS "UserType";

-- ← then your existing enum-creation and ALTER TABLE
CREATE TYPE "UserType" AS ENUM ('customer','staff');

ALTER TABLE "users"
  ALTER COLUMN "user_type"
  TYPE "UserType"
  USING user_type::text::"UserType";

-- AlterTable
ALTER TABLE "addresses" DROP COLUMN "address_type",
ADD COLUMN     "address_type" "AddressType" NOT NULL;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "user_type",
ADD COLUMN     "user_type" "UserType" NOT NULL;

-- RenameForeignKey
ALTER TABLE "addresses" RENAME CONSTRAINT "addresses_user_id_fkey" TO "address_user_fk";

-- RenameForeignKey
ALTER TABLE "credit_cards" RENAME CONSTRAINT "credit_cards_billing_address_id_fkey" TO "creditcard_address_fk";

-- RenameForeignKey
ALTER TABLE "credit_cards" RENAME CONSTRAINT "credit_cards_customer_id_fkey" TO "creditcard_customer_fk";

-- AddForeignKey
ALTER TABLE "addresses" ADD CONSTRAINT "address_customer_fk" FOREIGN KEY ("user_id") REFERENCES "customers"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;
