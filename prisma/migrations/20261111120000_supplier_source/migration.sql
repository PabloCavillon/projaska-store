-- AlterTable
ALTER TABLE "Product" ADD COLUMN "imageHeight" INTEGER,
ADD COLUMN "imageWidth" INTEGER,
ADD COLUMN "sourceId" TEXT,
ADD COLUMN "sourceUrl" TEXT,
ADD COLUMN "supplier" TEXT DEFAULT 'lococo';

-- CreateIndex (Postgres deja repetir los NULL)
CREATE UNIQUE INDEX "Product_supplier_sourceId_key" ON "Product"("supplier", "sourceId");
