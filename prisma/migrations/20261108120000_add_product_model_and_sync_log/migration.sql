-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "model" TEXT;

-- CreateTable
CREATE TABLE "ProductSyncLog" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "field" TEXT NOT NULL,
    "oldValue" TEXT,
    "newValue" TEXT,
    "source" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProductSyncLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Product_model_idx" ON "Product"("model");

-- CreateIndex
CREATE INDEX "ProductSyncLog_productId_idx" ON "ProductSyncLog"("productId");

-- AddForeignKey
ALTER TABLE "ProductSyncLog" ADD CONSTRAINT "ProductSyncLog_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
