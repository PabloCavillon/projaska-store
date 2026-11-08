-- CreateTable
CREATE TABLE "RevocationRequest" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "orderCode" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RevocationRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RevocationRequest_code_key" ON "RevocationRequest"("code");
