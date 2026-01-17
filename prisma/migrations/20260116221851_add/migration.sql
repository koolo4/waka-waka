-- AlterTable
ALTER TABLE "anime" ADD COLUMN "anilist_id" INTEGER;
ALTER TABLE "anime" ADD COLUMN "external_popularity" INTEGER;
ALTER TABLE "anime" ADD COLUMN "external_rating" REAL;
ALTER TABLE "anime" ADD COLUMN "external_source" TEXT;
ALTER TABLE "anime" ADD COLUMN "last_synced_at" DATETIME;
ALTER TABLE "anime" ADD COLUMN "mal_id" INTEGER;
