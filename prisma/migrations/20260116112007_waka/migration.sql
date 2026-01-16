-- CreateIndex
CREATE INDEX "comments_anime_id_idx" ON "comments"("anime_id");

-- CreateIndex
CREATE INDEX "comments_user_id_idx" ON "comments"("user_id");

-- CreateIndex
CREATE INDEX "comments_created_at_idx" ON "comments"("created_at");

-- CreateIndex
CREATE INDEX "ratings_anime_id_idx" ON "ratings"("anime_id");

-- CreateIndex
CREATE INDEX "ratings_user_id_idx" ON "ratings"("user_id");

-- CreateIndex
CREATE INDEX "user_anime_status_user_id_idx" ON "user_anime_status"("user_id");

-- CreateIndex
CREATE INDEX "user_anime_status_anime_id_idx" ON "user_anime_status"("anime_id");
