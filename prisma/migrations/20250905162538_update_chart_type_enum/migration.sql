/*
  Warnings:

  - The values [SCATTER,HISTOGRAM,HEATMAP,SCATTER_3D] on the enum `ChartType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."ChartType_new" AS ENUM ('GAUGE', 'LINE', 'BAR', 'ONOFF', 'STEP', 'PIE');
ALTER TABLE "public"."view_cards" ALTER COLUMN "chart_type" TYPE "public"."ChartType_new" USING ("chart_type"::text::"public"."ChartType_new");
ALTER TYPE "public"."ChartType" RENAME TO "ChartType_old";
ALTER TYPE "public"."ChartType_new" RENAME TO "ChartType";
DROP TYPE "public"."ChartType_old";
COMMIT;
