-- CreateTable
CREATE TABLE "public"."Tenant" (
    "tenant_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "cnpj" TEXT,
    "address" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "Tenant_pkey" PRIMARY KEY ("tenant_id")
);

-- CreateTable
CREATE TABLE "public"."User" (
    "user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "access_type" TEXT NOT NULL DEFAULT 'USER',
    "user_type" TEXT NOT NULL DEFAULT 'STANDARD',
    "first_login" BOOLEAN NOT NULL DEFAULT true,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),
    "tenant_id" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "public"."Role" (
    "role_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "Role_pkey" PRIMARY KEY ("role_id")
);

-- CreateTable
CREATE TABLE "public"."UserRole" (
    "user_id" TEXT NOT NULL,
    "role_id" TEXT NOT NULL,

    CONSTRAINT "UserRole_pkey" PRIMARY KEY ("user_id","role_id")
);

-- CreateTable
CREATE TABLE "public"."TokenCodeEmail" (
    "token_code_email_id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),
    "expired_at" TIMESTAMP(3) NOT NULL,
    "user_id" TEXT,

    CONSTRAINT "TokenCodeEmail_pkey" PRIMARY KEY ("token_code_email_id")
);

-- CreateTable
CREATE TABLE "public"."RefreshToken" (
    "refresh_token_id" TEXT NOT NULL,
    "refresh_token" TEXT NOT NULL,
    "expires_in" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),
    "user_id" TEXT,

    CONSTRAINT "RefreshToken_pkey" PRIMARY KEY ("refresh_token_id")
);

-- CreateTable
CREATE TABLE "public"."MeasurementUnit" (
    "measurement_unit_id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "unit_symbol" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),
    "tenant_id" TEXT NOT NULL,

    CONSTRAINT "MeasurementUnit_pkey" PRIMARY KEY ("measurement_unit_id")
);

-- CreateTable
CREATE TABLE "public"."Sensor" (
    "sensor_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "min_scale" INTEGER,
    "max_scale" INTEGER,
    "min_alarm" INTEGER,
    "max_alarm" INTEGER,
    "gain" INTEGER,
    "input_mode" TEXT,
    "ix" INTEGER,
    "gauge_color" TEXT,
    "offset" INTEGER,
    "alarm_timeout" INTEGER,
    "counter_name" TEXT,
    "frequency_counter_name" TEXT,
    "speed_source" BOOLEAN,
    "interrupt_transition" TEXT,
    "time_unit" TEXT,
    "speed_unit" TEXT,
    "sampling_interval" INTEGER,
    "minimum_period" INTEGER,
    "maximum_period" INTEGER,
    "frequency_resolution" INTEGER,
    "sensor_type" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),
    "measurement_unit_id" TEXT NOT NULL,
    "module_id" TEXT NOT NULL,

    CONSTRAINT "Sensor_pkey" PRIMARY KEY ("sensor_id")
);

-- CreateTable
CREATE TABLE "public"."Module" (
    "module_id" TEXT NOT NULL,
    "customer" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "blueprint" TEXT NOT NULL,
    "sector" TEXT NOT NULL,
    "machine_name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),
    "tenant_id" TEXT NOT NULL,
    "machine_id" TEXT,

    CONSTRAINT "Module_pkey" PRIMARY KEY ("module_id")
);

-- CreateTable
CREATE TABLE "public"."Machine" (
    "machine_id" TEXT NOT NULL,
    "operational_sector" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "manufacturer" TEXT NOT NULL,
    "serial_number" TEXT NOT NULL,
    "year_of_manufacture" TEXT NOT NULL,
    "year_of_installation" TEXT NOT NULL,
    "max_performance" INTEGER NOT NULL,
    "speed_measure_tech" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),
    "tenant_id" TEXT NOT NULL,

    CONSTRAINT "Machine_pkey" PRIMARY KEY ("machine_id")
);

-- CreateTable
CREATE TABLE "public"."ProductOrder" (
    "product_order_id" TEXT NOT NULL,
    "production_order" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "job_run" INTEGER NOT NULL,
    "start_production" TIMESTAMP(3) NOT NULL,
    "expected_run_time" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),
    "tenant_id" TEXT,

    CONSTRAINT "ProductOrder_pkey" PRIMARY KEY ("product_order_id")
);

-- CreateTable
CREATE TABLE "public"."ProcessOrder" (
    "process_order_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "job_run" INTEGER NOT NULL,
    "planned_speed" DOUBLE PRECISION NOT NULL,
    "start_production" TIMESTAMP(3) NOT NULL,
    "expected_run_time" TIMESTAMP(3) NOT NULL,
    "programmed_multiplier" DOUBLE PRECISION,
    "real_multiplier" DOUBLE PRECISION,
    "zero_speed_threshold" DOUBLE PRECISION,
    "production_speed_threshold" DOUBLE PRECISION,
    "zero_speed_timeout" DOUBLE PRECISION,
    "production_speed_timeout" DOUBLE PRECISION,
    "cycle_to_run" DOUBLE PRECISION,
    "cycle_time" DOUBLE PRECISION,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),
    "machine_id" TEXT,
    "user_id" TEXT,
    "product_order_id" TEXT NOT NULL,

    CONSTRAINT "ProcessOrder_pkey" PRIMARY KEY ("process_order_id")
);

-- CreateTable
CREATE TABLE "public"."Shift" (
    "shift_id" TEXT NOT NULL,
    "shift_name" TEXT NOT NULL,
    "shift_start" TEXT NOT NULL,
    "shift_end" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),
    "tenant_id" TEXT NOT NULL,

    CONSTRAINT "Shift_pkey" PRIMARY KEY ("shift_id")
);

-- CreateTable
CREATE TABLE "public"."StopCause" (
    "stop_cause_id" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "parent_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),
    "tenant_id" TEXT NOT NULL,

    CONSTRAINT "StopCause_pkey" PRIMARY KEY ("stop_cause_id")
);

-- CreateTable
CREATE TABLE "public"."CategoriesResponsible" (
    "category_responsible_id" TEXT NOT NULL,
    "category_responsible" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),
    "tenant_id" TEXT,

    CONSTRAINT "CategoriesResponsible_pkey" PRIMARY KEY ("category_responsible_id")
);

-- CreateTable
CREATE TABLE "public"."Responsible" (
    "responsible_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code_responsible" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),
    "tenant_id" TEXT,
    "category_responsible_id" TEXT,

    CONSTRAINT "Responsible_pkey" PRIMARY KEY ("responsible_id")
);

-- CreateTable
CREATE TABLE "public"."EventDescription" (
    "event_description_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "app" TEXT NOT NULL,
    "viewed" BOOLEAN NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),
    "job_run_data_id" TEXT,
    "stop_cause_id" TEXT,
    "sensor_id" TEXT,
    "responsible_id" TEXT,
    "process_order_id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,

    CONSTRAINT "EventDescription_pkey" PRIMARY KEY ("event_description_id")
);

-- CreateTable
CREATE TABLE "public"."Application" (
    "application_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "Application_pkey" PRIMARY KEY ("application_id")
);

-- CreateTable
CREATE TABLE "public"."TenantSubscription" (
    "tenantSubscription_id" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "subscriptionPlan" TEXT NOT NULL,
    "maxUsers" INTEGER,
    "expiresAt" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),
    "tenant_id" TEXT NOT NULL,
    "application_id" TEXT NOT NULL,

    CONSTRAINT "TenantSubscription_pkey" PRIMARY KEY ("tenantSubscription_id")
);

-- CreateTable
CREATE TABLE "public"."Permission" (
    "permission_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "description" TEXT,
    "module" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),
    "application_id" TEXT NOT NULL,

    CONSTRAINT "Permission_pkey" PRIMARY KEY ("permission_id")
);

-- CreateTable
CREATE TABLE "public"."UserPermission" (
    "userPermission_id" TEXT NOT NULL,
    "granted" BOOLEAN NOT NULL DEFAULT true,
    "grantedBy" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),
    "user_id" TEXT NOT NULL,
    "permission_id" TEXT NOT NULL,

    CONSTRAINT "UserPermission_pkey" PRIMARY KEY ("userPermission_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Tenant_cnpj_key" ON "public"."Tenant"("cnpj");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "RefreshToken_refresh_token_key" ON "public"."RefreshToken"("refresh_token");

-- CreateIndex
CREATE UNIQUE INDEX "Application_name_key" ON "public"."Application"("name");

-- AddForeignKey
ALTER TABLE "public"."User" ADD CONSTRAINT "User_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."Tenant"("tenant_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserRole" ADD CONSTRAINT "UserRole_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserRole" ADD CONSTRAINT "UserRole_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "public"."Role"("role_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TokenCodeEmail" ADD CONSTRAINT "TokenCodeEmail_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."User"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."RefreshToken" ADD CONSTRAINT "RefreshToken_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."User"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MeasurementUnit" ADD CONSTRAINT "MeasurementUnit_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."Tenant"("tenant_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Sensor" ADD CONSTRAINT "Sensor_measurement_unit_id_fkey" FOREIGN KEY ("measurement_unit_id") REFERENCES "public"."MeasurementUnit"("measurement_unit_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Sensor" ADD CONSTRAINT "Sensor_module_id_fkey" FOREIGN KEY ("module_id") REFERENCES "public"."Module"("module_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Module" ADD CONSTRAINT "Module_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."Tenant"("tenant_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Module" ADD CONSTRAINT "Module_machine_id_fkey" FOREIGN KEY ("machine_id") REFERENCES "public"."Machine"("machine_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Machine" ADD CONSTRAINT "Machine_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."Tenant"("tenant_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProductOrder" ADD CONSTRAINT "ProductOrder_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."Tenant"("tenant_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProcessOrder" ADD CONSTRAINT "ProcessOrder_machine_id_fkey" FOREIGN KEY ("machine_id") REFERENCES "public"."Machine"("machine_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProcessOrder" ADD CONSTRAINT "ProcessOrder_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."User"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProcessOrder" ADD CONSTRAINT "ProcessOrder_product_order_id_fkey" FOREIGN KEY ("product_order_id") REFERENCES "public"."ProductOrder"("product_order_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Shift" ADD CONSTRAINT "Shift_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."Tenant"("tenant_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."StopCause" ADD CONSTRAINT "StopCause_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "public"."StopCause"("stop_cause_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."StopCause" ADD CONSTRAINT "StopCause_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."Tenant"("tenant_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CategoriesResponsible" ADD CONSTRAINT "CategoriesResponsible_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."Tenant"("tenant_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Responsible" ADD CONSTRAINT "Responsible_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."Tenant"("tenant_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Responsible" ADD CONSTRAINT "Responsible_category_responsible_id_fkey" FOREIGN KEY ("category_responsible_id") REFERENCES "public"."CategoriesResponsible"("category_responsible_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EventDescription" ADD CONSTRAINT "EventDescription_stop_cause_id_fkey" FOREIGN KEY ("stop_cause_id") REFERENCES "public"."StopCause"("stop_cause_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EventDescription" ADD CONSTRAINT "EventDescription_sensor_id_fkey" FOREIGN KEY ("sensor_id") REFERENCES "public"."Sensor"("sensor_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EventDescription" ADD CONSTRAINT "EventDescription_responsible_id_fkey" FOREIGN KEY ("responsible_id") REFERENCES "public"."Responsible"("responsible_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EventDescription" ADD CONSTRAINT "EventDescription_process_order_id_fkey" FOREIGN KEY ("process_order_id") REFERENCES "public"."ProcessOrder"("process_order_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EventDescription" ADD CONSTRAINT "EventDescription_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."Tenant"("tenant_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TenantSubscription" ADD CONSTRAINT "TenantSubscription_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."Tenant"("tenant_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TenantSubscription" ADD CONSTRAINT "TenantSubscription_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "public"."Application"("application_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Permission" ADD CONSTRAINT "Permission_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "public"."Application"("application_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserPermission" ADD CONSTRAINT "UserPermission_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserPermission" ADD CONSTRAINT "UserPermission_permission_id_fkey" FOREIGN KEY ("permission_id") REFERENCES "public"."Permission"("permission_id") ON DELETE RESTRICT ON UPDATE CASCADE;
