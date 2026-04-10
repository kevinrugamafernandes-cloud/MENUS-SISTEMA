/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `internal_users` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "internal_users_name_key" ON "internal_users"("name");
