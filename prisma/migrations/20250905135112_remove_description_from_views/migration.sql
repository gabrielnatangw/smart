/*
  Warnings:

  - You are about to drop the column `description` on the `view_cards` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `views` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."view_cards" DROP COLUMN "description";

-- AlterTable
ALTER TABLE "public"."views" DROP COLUMN "description";
