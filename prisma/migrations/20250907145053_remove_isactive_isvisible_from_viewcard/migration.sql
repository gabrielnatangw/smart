/*
  Warnings:

  - You are about to drop the column `is_active` on the `view_cards` table. All the data in the column will be lost.
  - You are about to drop the column `is_visible` on the `view_cards` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."view_cards" DROP COLUMN "is_active",
DROP COLUMN "is_visible";
