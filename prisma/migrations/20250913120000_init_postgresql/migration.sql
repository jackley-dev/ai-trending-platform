-- CreateTable
CREATE TABLE "data_sources" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "baseUrl" TEXT,
    "apiConfig" TEXT,
    "crawlerConfig" TEXT,
    "updateFrequencyHours" INTEGER NOT NULL DEFAULT 24,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastUpdated" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "data_sources_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "items" (
    "id" SERIAL NOT NULL,
    "sourceId" INTEGER NOT NULL,
    "externalId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "url" TEXT NOT NULL,
    "authorName" TEXT,
    "authorUrl" TEXT,
    "popularityScore" INTEGER NOT NULL DEFAULT 0,
    "metrics" TEXT NOT NULL DEFAULT '{}',
    "primaryCategory" TEXT,
    "contentType" TEXT NOT NULL,
    "publishedAt" TIMESTAMP(3) NOT NULL,
    "lastUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "trendingDate" TIMESTAMP(3),
    "rawData" TEXT,
    "processedMetadata" TEXT NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tags" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "parentId" INTEGER,
    "displayName" TEXT,
    "description" TEXT,
    "color" TEXT NOT NULL DEFAULT '#6B7280',
    "icon" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "item_tags" (
    "id" SERIAL NOT NULL,
    "itemId" INTEGER NOT NULL,
    "tagId" INTEGER NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "source" TEXT NOT NULL DEFAULT 'manual',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "item_tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "processing_jobs" (
    "id" SERIAL NOT NULL,
    "sourceId" INTEGER NOT NULL,
    "jobType" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "priority" INTEGER NOT NULL DEFAULT 5,
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "config" TEXT NOT NULL DEFAULT '{}',
    "result" TEXT,
    "error" TEXT,
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "maxRetries" INTEGER NOT NULL DEFAULT 3,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "processing_jobs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "data_sources_name_key" ON "data_sources"("name");

-- CreateIndex
CREATE INDEX "items_sourceId_trendingDate_idx" ON "items"("sourceId", "trendingDate");

-- CreateIndex
CREATE INDEX "items_popularityScore_idx" ON "items"("popularityScore");

-- CreateIndex
CREATE INDEX "items_publishedAt_idx" ON "items"("publishedAt");

-- CreateIndex
CREATE INDEX "items_primaryCategory_idx" ON "items"("primaryCategory");

-- CreateIndex
CREATE UNIQUE INDEX "items_sourceId_externalId_key" ON "items"("sourceId", "externalId");

-- CreateIndex
CREATE UNIQUE INDEX "tags_name_key" ON "tags"("name");

-- CreateIndex
CREATE UNIQUE INDEX "tags_slug_key" ON "tags"("slug");

-- CreateIndex
CREATE INDEX "tags_category_idx" ON "tags"("category");

-- CreateIndex
CREATE INDEX "tags_isFeatured_idx" ON "tags"("isFeatured");

-- CreateIndex
CREATE UNIQUE INDEX "item_tags_itemId_tagId_key" ON "item_tags"("itemId", "tagId");

-- CreateIndex
CREATE INDEX "processing_jobs_sourceId_idx" ON "processing_jobs"("sourceId");

-- CreateIndex
CREATE INDEX "processing_jobs_status_idx" ON "processing_jobs"("status");

-- CreateIndex
CREATE INDEX "processing_jobs_scheduledAt_idx" ON "processing_jobs"("scheduledAt");

-- AddForeignKey
ALTER TABLE "items" ADD CONSTRAINT "items_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "data_sources"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tags" ADD CONSTRAINT "tags_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "tags"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "item_tags" ADD CONSTRAINT "item_tags_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "item_tags" ADD CONSTRAINT "item_tags_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "tags"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "processing_jobs" ADD CONSTRAINT "processing_jobs_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "data_sources"("id") ON DELETE RESTRICT ON UPDATE CASCADE;