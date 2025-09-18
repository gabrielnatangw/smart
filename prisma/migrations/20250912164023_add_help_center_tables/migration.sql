-- CreateEnum
CREATE TYPE "public"."VideoPlatform" AS ENUM ('YOUTUBE', 'VIMEO', 'DAILYMOTION', 'CUSTOM');

-- CreateTable
CREATE TABLE "public"."help_center_themes" (
    "theme_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "icon_name" TEXT,
    "color" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "help_center_themes_pkey" PRIMARY KEY ("theme_id")
);

-- CreateTable
CREATE TABLE "public"."help_center_videos" (
    "video_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "video_platform" "public"."VideoPlatform" NOT NULL DEFAULT 'YOUTUBE',
    "external_video_id" TEXT NOT NULL,
    "external_url" TEXT NOT NULL,
    "thumbnail_url" TEXT,
    "duration" INTEGER,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_featured" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),
    "theme_id" TEXT NOT NULL,

    CONSTRAINT "help_center_videos_pkey" PRIMARY KEY ("video_id")
);

-- CreateTable
CREATE TABLE "public"."help_center_theme_applications" (
    "theme_application_id" TEXT NOT NULL,
    "theme_id" TEXT NOT NULL,
    "application_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "help_center_theme_applications_pkey" PRIMARY KEY ("theme_application_id")
);

-- CreateTable
CREATE TABLE "public"."help_center_video_applications" (
    "video_application_id" TEXT NOT NULL,
    "video_id" TEXT NOT NULL,
    "application_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "help_center_video_applications_pkey" PRIMARY KEY ("video_application_id")
);

-- CreateTable
CREATE TABLE "public"."help_center_user_views" (
    "view_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "video_id" TEXT NOT NULL,
    "viewed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "watch_duration" INTEGER,
    "completed" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "help_center_user_views_pkey" PRIMARY KEY ("view_id")
);

-- CreateTable
CREATE TABLE "public"."help_center_searches" (
    "search_id" TEXT NOT NULL,
    "user_id" TEXT,
    "search_term" TEXT NOT NULL,
    "results_count" INTEGER NOT NULL,
    "searched_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "help_center_searches_pkey" PRIMARY KEY ("search_id")
);

-- CreateIndex
CREATE INDEX "help_center_themes_is_active_idx" ON "public"."help_center_themes"("is_active");

-- CreateIndex
CREATE INDEX "help_center_themes_sort_order_idx" ON "public"."help_center_themes"("sort_order");

-- CreateIndex
CREATE INDEX "help_center_videos_theme_id_idx" ON "public"."help_center_videos"("theme_id");

-- CreateIndex
CREATE INDEX "help_center_videos_is_active_idx" ON "public"."help_center_videos"("is_active");

-- CreateIndex
CREATE INDEX "help_center_videos_is_featured_idx" ON "public"."help_center_videos"("is_featured");

-- CreateIndex
CREATE INDEX "help_center_videos_sort_order_idx" ON "public"."help_center_videos"("sort_order");

-- CreateIndex
CREATE INDEX "help_center_theme_applications_theme_id_idx" ON "public"."help_center_theme_applications"("theme_id");

-- CreateIndex
CREATE INDEX "help_center_theme_applications_application_id_idx" ON "public"."help_center_theme_applications"("application_id");

-- CreateIndex
CREATE UNIQUE INDEX "help_center_theme_applications_theme_id_application_id_key" ON "public"."help_center_theme_applications"("theme_id", "application_id");

-- CreateIndex
CREATE INDEX "help_center_video_applications_video_id_idx" ON "public"."help_center_video_applications"("video_id");

-- CreateIndex
CREATE INDEX "help_center_video_applications_application_id_idx" ON "public"."help_center_video_applications"("application_id");

-- CreateIndex
CREATE UNIQUE INDEX "help_center_video_applications_video_id_application_id_key" ON "public"."help_center_video_applications"("video_id", "application_id");

-- CreateIndex
CREATE INDEX "help_center_user_views_user_id_idx" ON "public"."help_center_user_views"("user_id");

-- CreateIndex
CREATE INDEX "help_center_user_views_video_id_idx" ON "public"."help_center_user_views"("video_id");

-- CreateIndex
CREATE INDEX "help_center_user_views_viewed_at_idx" ON "public"."help_center_user_views"("viewed_at");

-- CreateIndex
CREATE UNIQUE INDEX "help_center_user_views_user_id_video_id_key" ON "public"."help_center_user_views"("user_id", "video_id");

-- CreateIndex
CREATE INDEX "help_center_searches_user_id_idx" ON "public"."help_center_searches"("user_id");

-- CreateIndex
CREATE INDEX "help_center_searches_searched_at_idx" ON "public"."help_center_searches"("searched_at");

-- AddForeignKey
ALTER TABLE "public"."help_center_videos" ADD CONSTRAINT "help_center_videos_theme_id_fkey" FOREIGN KEY ("theme_id") REFERENCES "public"."help_center_themes"("theme_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."help_center_theme_applications" ADD CONSTRAINT "help_center_theme_applications_theme_id_fkey" FOREIGN KEY ("theme_id") REFERENCES "public"."help_center_themes"("theme_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."help_center_theme_applications" ADD CONSTRAINT "help_center_theme_applications_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "public"."Application"("application_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."help_center_video_applications" ADD CONSTRAINT "help_center_video_applications_video_id_fkey" FOREIGN KEY ("video_id") REFERENCES "public"."help_center_videos"("video_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."help_center_video_applications" ADD CONSTRAINT "help_center_video_applications_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "public"."Application"("application_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."help_center_user_views" ADD CONSTRAINT "help_center_user_views_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."help_center_user_views" ADD CONSTRAINT "help_center_user_views_video_id_fkey" FOREIGN KEY ("video_id") REFERENCES "public"."help_center_videos"("video_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."help_center_searches" ADD CONSTRAINT "help_center_searches_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."User"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;
