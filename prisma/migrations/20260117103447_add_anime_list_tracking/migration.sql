-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_user_anime_status" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "user_id" INTEGER NOT NULL,
    "anime_id" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "current_episode" INTEGER NOT NULL DEFAULT 0,
    "total_episodes" INTEGER NOT NULL DEFAULT 0,
    "watch_percentage" REAL NOT NULL DEFAULT 0,
    "start_date" DATETIME,
    "end_date" DATETIME,
    "is_favorite" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "user_anime_status_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "user_anime_status_anime_id_fkey" FOREIGN KEY ("anime_id") REFERENCES "anime" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_user_anime_status" ("anime_id", "created_at", "id", "status", "updated_at", "user_id") SELECT "anime_id", "created_at", "id", "status", "updated_at", "user_id" FROM "user_anime_status";
DROP TABLE "user_anime_status";
ALTER TABLE "new_user_anime_status" RENAME TO "user_anime_status";
CREATE INDEX "user_anime_status_user_id_idx" ON "user_anime_status"("user_id");
CREATE INDEX "user_anime_status_anime_id_idx" ON "user_anime_status"("anime_id");
CREATE UNIQUE INDEX "user_anime_status_user_id_anime_id_key" ON "user_anime_status"("user_id", "anime_id");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
