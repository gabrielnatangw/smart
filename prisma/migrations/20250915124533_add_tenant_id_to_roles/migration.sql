/*
  Warnings:

  - Added the required column `tenant_id` to the `Role` table without a default value. This is not possible if the table is not empty.

*/
-- Step 1: Add tenant_id column as nullable
ALTER TABLE "public"."Role" ADD COLUMN "tenant_id" TEXT;

-- Step 2: Update existing roles to use the default tenant
UPDATE "public"."Role" 
SET "tenant_id" = (SELECT "tenant_id" FROM "public"."Tenant" WHERE "name" = 'Default Tenant' LIMIT 1)
WHERE "tenant_id" IS NULL;

-- Step 3: Make tenant_id NOT NULL
ALTER TABLE "public"."Role" ALTER COLUMN "tenant_id" SET NOT NULL;

-- Step 4: Create index
CREATE INDEX "Role_tenant_id_idx" ON "public"."Role"("tenant_id");

-- Step 5: Add foreign key constraint
ALTER TABLE "public"."Role" ADD CONSTRAINT "Role_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."Tenant"("tenant_id") ON DELETE RESTRICT ON UPDATE CASCADE;
