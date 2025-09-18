-- CreateEnum
CREATE TYPE "public"."ChartType" AS ENUM ('GAUGE', 'LINE', 'BAR', 'ONOFF', 'STEP', 'PIE', 'SCATTER', 'HISTOGRAM', 'HEATMAP', 'SCATTER_3D');

-- CreateEnum
CREATE TYPE "public"."DataQuality" AS ENUM ('GOOD', 'BAD', 'UNCERTAIN', 'MAINTENANCE', 'OFFLINE');

-- CreateEnum
CREATE TYPE "public"."PermissionType" AS ENUM ('READ', 'WRITE', 'ADMIN', 'SHARE');

-- CreateTable
CREATE TABLE "public"."views" (
    "view_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "is_public" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),
    "tenant_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "created_by" TEXT NOT NULL,
    "updated_by" TEXT NOT NULL,

    CONSTRAINT "views_pkey" PRIMARY KEY ("view_id")
);

-- CreateTable
CREATE TABLE "public"."view_cards" (
    "card_id" TEXT NOT NULL,
    "view_id" TEXT NOT NULL,
    "sensor_id" TEXT NOT NULL,
    "module_id" TEXT NOT NULL,
    "machine_id" TEXT,
    "position_x" INTEGER NOT NULL DEFAULT 0,
    "position_y" INTEGER NOT NULL DEFAULT 0,
    "width" INTEGER NOT NULL DEFAULT 1,
    "height" INTEGER NOT NULL DEFAULT 1,
    "chart_type" "public"."ChartType" NOT NULL,
    "chart_config" JSONB NOT NULL DEFAULT '{}',
    "title" TEXT,
    "description" TEXT,
    "is_visible" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),
    "tenant_id" TEXT NOT NULL,
    "created_by" TEXT NOT NULL,
    "updated_by" TEXT NOT NULL,

    CONSTRAINT "view_cards_pkey" PRIMARY KEY ("card_id")
);

-- CreateTable
CREATE TABLE "public"."sensor_data" (
    "data_id" TEXT NOT NULL,
    "sensor_id" TEXT NOT NULL,
    "value" DECIMAL(15,6) NOT NULL,
    "raw_value" DECIMAL(15,6),
    "unit" TEXT,
    "quality" "public"."DataQuality" NOT NULL DEFAULT 'GOOD',
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "tenant_id" TEXT NOT NULL,

    CONSTRAINT "sensor_data_pkey" PRIMARY KEY ("data_id")
);

-- CreateTable
CREATE TABLE "public"."sensor_current_values" (
    "current_value_id" TEXT NOT NULL,
    "sensor_id" TEXT NOT NULL,
    "value" DECIMAL(15,6) NOT NULL,
    "raw_value" DECIMAL(15,6),
    "unit" TEXT,
    "quality" "public"."DataQuality" NOT NULL DEFAULT 'GOOD',
    "last_updated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "tenant_id" TEXT NOT NULL,

    CONSTRAINT "sensor_current_values_pkey" PRIMARY KEY ("current_value_id")
);

-- CreateTable
CREATE TABLE "public"."view_permissions" (
    "permission_id" TEXT NOT NULL,
    "view_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "permission" "public"."PermissionType" NOT NULL,
    "granted_by" TEXT NOT NULL,
    "granted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tenant_id" TEXT NOT NULL,

    CONSTRAINT "view_permissions_pkey" PRIMARY KEY ("permission_id")
);

-- CreateIndex
CREATE INDEX "views_tenant_id_idx" ON "public"."views"("tenant_id");

-- CreateIndex
CREATE INDEX "views_user_id_idx" ON "public"."views"("user_id");

-- CreateIndex
CREATE INDEX "views_is_public_idx" ON "public"."views"("is_public");

-- CreateIndex
CREATE INDEX "views_is_active_idx" ON "public"."views"("is_active");

-- CreateIndex
CREATE INDEX "views_created_at_idx" ON "public"."views"("created_at");

-- CreateIndex
CREATE INDEX "view_cards_view_id_idx" ON "public"."view_cards"("view_id");

-- CreateIndex
CREATE INDEX "view_cards_sensor_id_idx" ON "public"."view_cards"("sensor_id");

-- CreateIndex
CREATE INDEX "view_cards_module_id_idx" ON "public"."view_cards"("module_id");

-- CreateIndex
CREATE INDEX "view_cards_machine_id_idx" ON "public"."view_cards"("machine_id");

-- CreateIndex
CREATE INDEX "view_cards_chart_type_idx" ON "public"."view_cards"("chart_type");

-- CreateIndex
CREATE INDEX "view_cards_view_id_position_x_position_y_idx" ON "public"."view_cards"("view_id", "position_x", "position_y");

-- CreateIndex
CREATE INDEX "view_cards_tenant_id_idx" ON "public"."view_cards"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "view_cards_view_id_sensor_id_key" ON "public"."view_cards"("view_id", "sensor_id");

-- CreateIndex
CREATE INDEX "sensor_data_sensor_id_timestamp_idx" ON "public"."sensor_data"("sensor_id", "timestamp" DESC);

-- CreateIndex
CREATE INDEX "sensor_data_timestamp_idx" ON "public"."sensor_data"("timestamp" DESC);

-- CreateIndex
CREATE INDEX "sensor_data_quality_idx" ON "public"."sensor_data"("quality");

-- CreateIndex
CREATE INDEX "sensor_data_tenant_id_idx" ON "public"."sensor_data"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "sensor_current_values_sensor_id_key" ON "public"."sensor_current_values"("sensor_id");

-- CreateIndex
CREATE INDEX "sensor_current_values_last_updated_idx" ON "public"."sensor_current_values"("last_updated");

-- CreateIndex
CREATE INDEX "sensor_current_values_tenant_id_idx" ON "public"."sensor_current_values"("tenant_id");

-- CreateIndex
CREATE INDEX "view_permissions_tenant_id_idx" ON "public"."view_permissions"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "view_permissions_view_id_user_id_key" ON "public"."view_permissions"("view_id", "user_id");

-- AddForeignKey
ALTER TABLE "public"."views" ADD CONSTRAINT "views_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."Tenant"("tenant_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."views" ADD CONSTRAINT "views_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."views" ADD CONSTRAINT "views_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."views" ADD CONSTRAINT "views_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "public"."User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."view_cards" ADD CONSTRAINT "view_cards_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."Tenant"("tenant_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."view_cards" ADD CONSTRAINT "view_cards_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."view_cards" ADD CONSTRAINT "view_cards_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "public"."User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."view_cards" ADD CONSTRAINT "view_cards_view_id_fkey" FOREIGN KEY ("view_id") REFERENCES "public"."views"("view_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."view_cards" ADD CONSTRAINT "view_cards_sensor_id_fkey" FOREIGN KEY ("sensor_id") REFERENCES "public"."Sensor"("sensor_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."view_cards" ADD CONSTRAINT "view_cards_module_id_fkey" FOREIGN KEY ("module_id") REFERENCES "public"."Module"("module_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."view_cards" ADD CONSTRAINT "view_cards_machine_id_fkey" FOREIGN KEY ("machine_id") REFERENCES "public"."Machine"("machine_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."sensor_data" ADD CONSTRAINT "sensor_data_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."Tenant"("tenant_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."sensor_data" ADD CONSTRAINT "sensor_data_sensor_id_fkey" FOREIGN KEY ("sensor_id") REFERENCES "public"."Sensor"("sensor_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."sensor_current_values" ADD CONSTRAINT "sensor_current_values_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."Tenant"("tenant_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."sensor_current_values" ADD CONSTRAINT "sensor_current_values_sensor_id_fkey" FOREIGN KEY ("sensor_id") REFERENCES "public"."Sensor"("sensor_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."view_permissions" ADD CONSTRAINT "view_permissions_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."Tenant"("tenant_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."view_permissions" ADD CONSTRAINT "view_permissions_view_id_fkey" FOREIGN KEY ("view_id") REFERENCES "public"."views"("view_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."view_permissions" ADD CONSTRAINT "view_permissions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."view_permissions" ADD CONSTRAINT "view_permissions_granted_by_fkey" FOREIGN KEY ("granted_by") REFERENCES "public"."User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;
