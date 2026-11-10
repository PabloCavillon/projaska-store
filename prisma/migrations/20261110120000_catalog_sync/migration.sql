-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "sourceImageUrl" TEXT,
ADD COLUMN     "specs" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "stockStatus" TEXT;

-- AlterTable
ALTER TABLE "ProductSyncLog" ADD COLUMN     "op" TEXT;
