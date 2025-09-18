/*
  Migration to update user permission system to granular permissions
*/

-- DropForeignKey
ALTER TABLE "public"."User" DROP CONSTRAINT "User_tenant_id_fkey";

-- First, add new columns with default values
ALTER TABLE "public"."Permission" 
ADD COLUMN "display_name" TEXT,
ADD COLUMN "function_name" TEXT,
ADD COLUMN "permission_level" TEXT;

-- Migrate existing permission data
UPDATE "public"."Permission" 
SET 
  "function_name" = CASE 
    WHEN "module" = 'GERENCIAMENTO_DE_USUARIOS' THEN 'users'
    WHEN "module" = 'GERENCIAMENTO_DE_MAQUINAS' THEN 'machines'
    WHEN "module" = 'GERENCIAMENTO_DE_SENSORES' THEN 'sensors'
    ELSE 'general'
  END,
  "permission_level" = CASE 
    WHEN "name" LIKE 'READ_%' THEN 'read'
    WHEN "name" LIKE 'WRITE_%' THEN 'write'
    WHEN "name" LIKE 'DELETE_%' THEN 'delete'
    ELSE 'read'
  END,
  "display_name" = "displayName";

-- Now make the columns NOT NULL
ALTER TABLE "public"."Permission" 
ALTER COLUMN "display_name" SET NOT NULL,
ALTER COLUMN "function_name" SET NOT NULL,
ALTER COLUMN "permission_level" SET NOT NULL;

-- Drop old columns
ALTER TABLE "public"."Permission" 
DROP COLUMN "displayName",
DROP COLUMN "module",
DROP COLUMN "name";

-- Update User table
ALTER TABLE "public"."User" 
DROP COLUMN "access_type",
ALTER COLUMN "user_type" SET DEFAULT 'user',
ALTER COLUMN "tenant_id" DROP NOT NULL;

-- Update existing users to new user types
UPDATE "public"."User" 
SET "user_type" = CASE 
  WHEN "user_type" = 'ADMIN' THEN 'admin'
  WHEN "user_type" = 'STANDARD' THEN 'user'
  ELSE 'user'
END;

-- CreateIndex
CREATE UNIQUE INDEX "Permission_function_name_permission_level_application_id_key" ON "public"."Permission"("function_name", "permission_level", "application_id");

-- AddForeignKey
ALTER TABLE "public"."User" ADD CONSTRAINT "User_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."Tenant"("tenant_id") ON DELETE SET NULL ON UPDATE CASCADE;
