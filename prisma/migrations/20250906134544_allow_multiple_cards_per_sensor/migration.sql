/*
  Warnings:

  - A unique constraint covering the columns `[view_id,sensor_id,chart_type]` on the table `view_cards` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "public"."view_cards_view_id_sensor_id_key";

-- CreateIndex
CREATE UNIQUE INDEX "view_cards_view_id_sensor_id_chart_type_key" ON "public"."view_cards"("view_id", "sensor_id", "chart_type");
