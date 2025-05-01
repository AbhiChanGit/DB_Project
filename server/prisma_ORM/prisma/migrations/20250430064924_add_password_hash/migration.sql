/*
  Warnings:

  - The primary key for the `addresses` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `addresses` table. All the data in the column will be lost.
  - The primary key for the `cart_items` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `cart_items` table. All the data in the column will be lost.
  - The primary key for the `categories` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `categories` table. All the data in the column will be lost.
  - The primary key for the `credit_cards` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `credit_cards` table. All the data in the column will be lost.
  - The primary key for the `customers` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `customers` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `customers` table. All the data in the column will be lost.
  - You are about to alter the column `account_balance` on the `customers` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(10,2)`.
  - The primary key for the `delivery_plans` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `delivery_plans` table. All the data in the column will be lost.
  - You are about to alter the column `delivery_price` on the `delivery_plans` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(10,2)`.
  - The primary key for the `order_items` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `order_items` table. All the data in the column will be lost.
  - You are about to alter the column `unit_price` on the `order_items` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(10,2)`.
  - The primary key for the `orders` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `orders` table. All the data in the column will be lost.
  - You are about to alter the column `total_amount` on the `orders` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(10,2)`.
  - The primary key for the `product_prices` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `product_prices` table. All the data in the column will be lost.
  - You are about to alter the column `price` on the `product_prices` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(10,2)`.
  - The primary key for the `products` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `products` table. All the data in the column will be lost.
  - You are about to drop the column `image_url` on the `products` table. All the data in the column will be lost.
  - The primary key for the `shopping_carts` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `shopping_carts` table. All the data in the column will be lost.
  - The primary key for the `staff` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `staff` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `staff` table. All the data in the column will be lost.
  - You are about to alter the column `salary` on the `staff` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(10,2)`.
  - The primary key for the `stock` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `stock` table. All the data in the column will be lost.
  - The primary key for the `supplier_products` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `supplier_products` table. All the data in the column will be lost.
  - You are about to alter the column `supplier_price` on the `supplier_products` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(10,2)`.
  - The primary key for the `suppliers` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `suppliers` table. All the data in the column will be lost.
  - The primary key for the `users` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `password` on the `users` table. All the data in the column will be lost.
  - The primary key for the `warehouses` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `warehouses` table. All the data in the column will be lost.
  - You are about to alter the column `capacity` on the `warehouses` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(12,2)`.
  - You are about to alter the column `current_usage` on the `warehouses` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(12,2)`.
  - Changed the type of `address_type` on the `addresses` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `customer_id` to the `customers` table without a default value. This is not possible if the table is not empty.
  - Added the required column `staff_id` to the `staff` table without a default value. This is not possible if the table is not empty.
  - Added the required column `password_hash` to the `users` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `user_type` on the `users` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "addresses" DROP CONSTRAINT "address_customer_fk";

-- DropForeignKey
ALTER TABLE "addresses" DROP CONSTRAINT "address_user_fk";

-- DropForeignKey
ALTER TABLE "cart_items" DROP CONSTRAINT "cart_items_cart_id_fkey";

-- DropForeignKey
ALTER TABLE "cart_items" DROP CONSTRAINT "cart_items_product_id_fkey";

-- DropForeignKey
ALTER TABLE "credit_cards" DROP CONSTRAINT "creditcard_address_fk";

-- DropForeignKey
ALTER TABLE "credit_cards" DROP CONSTRAINT "creditcard_customer_fk";

-- DropForeignKey
ALTER TABLE "customers" DROP CONSTRAINT "customers_user_id_fkey";

-- DropForeignKey
ALTER TABLE "delivery_plans" DROP CONSTRAINT "delivery_plans_order_id_fkey";

-- DropForeignKey
ALTER TABLE "order_items" DROP CONSTRAINT "order_items_order_id_fkey";

-- DropForeignKey
ALTER TABLE "order_items" DROP CONSTRAINT "order_items_product_id_fkey";

-- DropForeignKey
ALTER TABLE "order_items" DROP CONSTRAINT "order_items_warehouse_id_fkey";

-- DropForeignKey
ALTER TABLE "orders" DROP CONSTRAINT "orders_credit_card_id_fkey";

-- DropForeignKey
ALTER TABLE "orders" DROP CONSTRAINT "orders_customer_id_fkey";

-- DropForeignKey
ALTER TABLE "product_prices" DROP CONSTRAINT "product_prices_product_id_fkey";

-- DropForeignKey
ALTER TABLE "product_prices" DROP CONSTRAINT "product_prices_set_by_staff_id_fkey";

-- DropForeignKey
ALTER TABLE "products" DROP CONSTRAINT "products_category_id_fkey";

-- DropForeignKey
ALTER TABLE "shopping_carts" DROP CONSTRAINT "shopping_carts_customer_id_fkey";

-- DropForeignKey
ALTER TABLE "staff" DROP CONSTRAINT "staff_user_id_fkey";

-- DropForeignKey
ALTER TABLE "stock" DROP CONSTRAINT "stock_product_id_fkey";

-- DropForeignKey
ALTER TABLE "stock" DROP CONSTRAINT "stock_updated_by_staff_id_fkey";

-- DropForeignKey
ALTER TABLE "stock" DROP CONSTRAINT "stock_warehouse_id_fkey";

-- DropForeignKey
ALTER TABLE "supplier_products" DROP CONSTRAINT "supplier_products_product_id_fkey";

-- DropForeignKey
ALTER TABLE "supplier_products" DROP CONSTRAINT "supplier_products_supplier_id_fkey";

-- DropForeignKey
ALTER TABLE "suppliers" DROP CONSTRAINT "suppliers_address_id_fkey";

-- DropForeignKey
ALTER TABLE "warehouses" DROP CONSTRAINT "warehouses_address_id_fkey";

-- DropIndex
DROP INDEX "customers_user_id_key";

-- DropIndex
DROP INDEX "delivery_plans_order_id_key";

-- DropIndex
DROP INDEX "staff_user_id_key";

-- AlterTable
ALTER TABLE "addresses" DROP CONSTRAINT "addresses_pkey",
DROP COLUMN "id",
ADD COLUMN     "address_id" SERIAL NOT NULL,
ALTER COLUMN "is_default" DROP NOT NULL,
DROP COLUMN "address_type",
ADD COLUMN     "address_type" VARCHAR(10) NOT NULL,
ADD CONSTRAINT "addresses_pkey" PRIMARY KEY ("address_id");

-- AlterTable
ALTER TABLE "cart_items" DROP CONSTRAINT "cart_items_pkey",
DROP COLUMN "id",
ADD COLUMN     "cart_item_id" SERIAL NOT NULL,
ALTER COLUMN "added_at" DROP NOT NULL,
ALTER COLUMN "added_at" SET DATA TYPE TIMESTAMP(6),
ADD CONSTRAINT "cart_items_pkey" PRIMARY KEY ("cart_item_id");

-- AlterTable
ALTER TABLE "categories" DROP CONSTRAINT "categories_pkey",
DROP COLUMN "id",
ADD COLUMN     "category_id" SERIAL NOT NULL,
ADD CONSTRAINT "categories_pkey" PRIMARY KEY ("category_id");

-- AlterTable
ALTER TABLE "credit_cards" DROP CONSTRAINT "credit_cards_pkey",
DROP COLUMN "id",
ADD COLUMN     "card_id" SERIAL NOT NULL,
ALTER COLUMN "expiry_date" SET DATA TYPE DATE,
ALTER COLUMN "is_default" DROP NOT NULL,
ADD CONSTRAINT "credit_cards_pkey" PRIMARY KEY ("card_id");

-- AlterTable
ALTER TABLE "customers" DROP CONSTRAINT "customers_pkey",
DROP COLUMN "id",
DROP COLUMN "user_id",
ADD COLUMN     "customer_id" INTEGER NOT NULL,
ALTER COLUMN "account_balance" DROP NOT NULL,
ALTER COLUMN "account_balance" SET DATA TYPE DECIMAL(10,2),
ADD CONSTRAINT "customers_pkey" PRIMARY KEY ("customer_id");

-- AlterTable
ALTER TABLE "delivery_plans" DROP CONSTRAINT "delivery_plans_pkey",
DROP COLUMN "id",
ADD COLUMN     "delivery_id" SERIAL NOT NULL,
ALTER COLUMN "delivery_type" DROP DEFAULT,
ALTER COLUMN "delivery_price" SET DATA TYPE DECIMAL(10,2),
ALTER COLUMN "ship_date" SET DATA TYPE DATE,
ALTER COLUMN "delivery_date" SET DATA TYPE DATE,
ADD CONSTRAINT "delivery_plans_pkey" PRIMARY KEY ("delivery_id");

-- AlterTable
ALTER TABLE "order_items" DROP CONSTRAINT "order_items_pkey",
DROP COLUMN "id",
ADD COLUMN     "order_item_id" SERIAL NOT NULL,
ALTER COLUMN "unit_price" SET DATA TYPE DECIMAL(10,2),
ADD CONSTRAINT "order_items_pkey" PRIMARY KEY ("order_item_id");

-- AlterTable
ALTER TABLE "orders" DROP CONSTRAINT "orders_pkey",
DROP COLUMN "id",
ADD COLUMN     "order_id" SERIAL NOT NULL,
ALTER COLUMN "order_date" DROP NOT NULL,
ALTER COLUMN "order_date" SET DATA TYPE TIMESTAMP(6),
ALTER COLUMN "total_amount" SET DATA TYPE DECIMAL(10,2),
ADD CONSTRAINT "orders_pkey" PRIMARY KEY ("order_id");

-- AlterTable
ALTER TABLE "product_prices" DROP CONSTRAINT "product_prices_pkey",
DROP COLUMN "id",
ADD COLUMN     "price_id" SERIAL NOT NULL,
ALTER COLUMN "price" SET DATA TYPE DECIMAL(10,2),
ALTER COLUMN "start_date" DROP NOT NULL,
ALTER COLUMN "start_date" SET DATA TYPE TIMESTAMP(6),
ALTER COLUMN "end_date" SET DATA TYPE TIMESTAMP(6),
ADD CONSTRAINT "product_prices_pkey" PRIMARY KEY ("price_id");

-- AlterTable
ALTER TABLE "products" DROP CONSTRAINT "products_pkey",
DROP COLUMN "id",
DROP COLUMN "image_url",
ADD COLUMN     "product_id" SERIAL NOT NULL,
ALTER COLUMN "created_at" DROP NOT NULL,
ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMP(6),
ALTER COLUMN "last_updated" DROP NOT NULL,
ALTER COLUMN "last_updated" SET DATA TYPE TIMESTAMP(6),
ADD CONSTRAINT "products_pkey" PRIMARY KEY ("product_id");

-- AlterTable
ALTER TABLE "shopping_carts" DROP CONSTRAINT "shopping_carts_pkey",
DROP COLUMN "id",
ADD COLUMN     "cart_id" SERIAL NOT NULL,
ALTER COLUMN "created_at" DROP NOT NULL,
ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMP(6),
ALTER COLUMN "last_updated" DROP NOT NULL,
ALTER COLUMN "last_updated" SET DATA TYPE TIMESTAMP(6),
ADD CONSTRAINT "shopping_carts_pkey" PRIMARY KEY ("cart_id");

-- AlterTable
ALTER TABLE "staff" DROP CONSTRAINT "staff_pkey",
DROP COLUMN "id",
DROP COLUMN "user_id",
ADD COLUMN     "staff_id" INTEGER NOT NULL,
ALTER COLUMN "salary" SET DATA TYPE DECIMAL(10,2),
ALTER COLUMN "hire_date" SET DATA TYPE DATE,
ADD CONSTRAINT "staff_pkey" PRIMARY KEY ("staff_id");

-- AlterTable
ALTER TABLE "stock" DROP CONSTRAINT "stock_pkey",
DROP COLUMN "id",
ADD COLUMN     "stock_id" SERIAL NOT NULL,
ALTER COLUMN "last_updated" DROP NOT NULL,
ALTER COLUMN "last_updated" SET DATA TYPE TIMESTAMP(6),
ADD CONSTRAINT "stock_pkey" PRIMARY KEY ("stock_id");

-- AlterTable
ALTER TABLE "supplier_products" DROP CONSTRAINT "supplier_products_pkey",
DROP COLUMN "id",
ADD COLUMN     "supplier_product_id" SERIAL NOT NULL,
ALTER COLUMN "supplier_price" SET DATA TYPE DECIMAL(10,2),
ADD CONSTRAINT "supplier_products_pkey" PRIMARY KEY ("supplier_product_id");

-- AlterTable
ALTER TABLE "suppliers" DROP CONSTRAINT "suppliers_pkey",
DROP COLUMN "id",
ADD COLUMN     "supplier_id" SERIAL NOT NULL,
ADD CONSTRAINT "suppliers_pkey" PRIMARY KEY ("supplier_id");

-- AlterTable
ALTER TABLE "users" DROP CONSTRAINT "users_pkey",
DROP COLUMN "id",
DROP COLUMN "password",
ADD COLUMN     "password_hash" VARCHAR(255) NOT NULL,
ADD COLUMN     "user_id" SERIAL NOT NULL,
ALTER COLUMN "created_at" DROP NOT NULL,
DROP COLUMN "user_type",
ADD COLUMN     "user_type" VARCHAR(10) NOT NULL,
ADD CONSTRAINT "users_pkey" PRIMARY KEY ("user_id");

-- AlterTable
ALTER TABLE "verifying" ALTER COLUMN "id" SET DEFAULT uuid_generate_v4(),
ALTER COLUMN "created_at" DROP NOT NULL;

-- AlterTable
ALTER TABLE "warehouses" DROP CONSTRAINT "warehouses_pkey",
DROP COLUMN "id",
ADD COLUMN     "warehouse_id" SERIAL NOT NULL,
ALTER COLUMN "capacity" SET DATA TYPE DECIMAL(12,2),
ALTER COLUMN "current_usage" DROP NOT NULL,
ALTER COLUMN "current_usage" SET DATA TYPE DECIMAL(12,2),
ADD CONSTRAINT "warehouses_pkey" PRIMARY KEY ("warehouse_id");

-- DropEnum
DROP TYPE "AddressType";

-- DropEnum
DROP TYPE "DeliveryType";

-- DropEnum
DROP TYPE "OrderStatus";

-- DropEnum
DROP TYPE "UserType";

-- CreateIndex
CREATE INDEX "idx_order_customer" ON "orders"("customer_id");

-- CreateIndex
CREATE INDEX "idx_order_date" ON "orders"("order_date");

-- CreateIndex
CREATE INDEX "idx_order_status" ON "orders"("status");

-- CreateIndex
CREATE INDEX "idx_products_category" ON "products"("category_id");

-- CreateIndex
CREATE INDEX "idx_cart_customer" ON "shopping_carts"("customer_id");

-- CreateIndex
CREATE INDEX "idx_stock_product" ON "stock"("product_id");

-- CreateIndex
CREATE INDEX "idx_stock_warehouse" ON "stock"("warehouse_id");

-- AddForeignKey
ALTER TABLE "customers" ADD CONSTRAINT "customers_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "staff" ADD CONSTRAINT "staff_staff_id_fkey" FOREIGN KEY ("staff_id") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "addresses" ADD CONSTRAINT "address_user_fk" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "credit_cards" ADD CONSTRAINT "creditcard_address_fk" FOREIGN KEY ("billing_address_id") REFERENCES "addresses"("address_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "credit_cards" ADD CONSTRAINT "creditcard_customer_fk" FOREIGN KEY ("customer_id") REFERENCES "customers"("customer_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("category_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "product_prices" ADD CONSTRAINT "product_prices_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("product_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "product_prices" ADD CONSTRAINT "product_prices_set_by_staff_id_fkey" FOREIGN KEY ("set_by_staff_id") REFERENCES "staff"("staff_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "warehouses" ADD CONSTRAINT "warehouses_address_id_fkey" FOREIGN KEY ("address_id") REFERENCES "addresses"("address_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "stock" ADD CONSTRAINT "stock_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("product_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "stock" ADD CONSTRAINT "stock_updated_by_staff_id_fkey" FOREIGN KEY ("updated_by_staff_id") REFERENCES "staff"("staff_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "stock" ADD CONSTRAINT "stock_warehouse_id_fkey" FOREIGN KEY ("warehouse_id") REFERENCES "warehouses"("warehouse_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "shopping_carts" ADD CONSTRAINT "shopping_carts_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("customer_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_cart_id_fkey" FOREIGN KEY ("cart_id") REFERENCES "shopping_carts"("cart_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("product_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_credit_card_id_fkey" FOREIGN KEY ("credit_card_id") REFERENCES "credit_cards"("card_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("customer_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("order_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("product_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_warehouse_id_fkey" FOREIGN KEY ("warehouse_id") REFERENCES "warehouses"("warehouse_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "delivery_plans" ADD CONSTRAINT "delivery_plans_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("order_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "suppliers" ADD CONSTRAINT "suppliers_address_id_fkey" FOREIGN KEY ("address_id") REFERENCES "addresses"("address_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "supplier_products" ADD CONSTRAINT "supplier_products_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("product_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "supplier_products" ADD CONSTRAINT "supplier_products_supplier_id_fkey" FOREIGN KEY ("supplier_id") REFERENCES "suppliers"("supplier_id") ON DELETE NO ACTION ON UPDATE NO ACTION;
