-- CreateTable
CREATE TABLE "site_versions" (
    "id" TEXT NOT NULL,
    "site_id" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "prompt" TEXT,
    "schema_json" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "site_versions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "site_versions_site_id_idx" ON "site_versions"("site_id");

-- CreateIndex
CREATE UNIQUE INDEX "site_versions_site_id_version_key" ON "site_versions"("site_id", "version");

-- AddForeignKey
ALTER TABLE "site_versions" ADD CONSTRAINT "site_versions_site_id_fkey" FOREIGN KEY ("site_id") REFERENCES "sites"("id") ON DELETE CASCADE ON UPDATE CASCADE;
