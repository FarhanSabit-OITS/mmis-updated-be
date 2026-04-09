-- CreateTable
CREATE TABLE "requisitions" (
    "id" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "marketId" TEXT,
    "title" VARCHAR(200) NOT NULL,
    "description" TEXT,
    "deadline" TIMESTAMP(3) NOT NULL,
    "budget" DECIMAL(15,2),
    "status" VARCHAR(30) NOT NULL DEFAULT 'OPEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "requisitions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "requisition_items" (
    "id" TEXT NOT NULL,
    "requisitionId" TEXT NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "quantity" DECIMAL(10,2) NOT NULL,
    "unit" VARCHAR(50) NOT NULL,
    "specifications" TEXT,

    CONSTRAINT "requisition_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "supplier_bids" (
    "id" TEXT NOT NULL,
    "requisitionId" TEXT NOT NULL,
    "supplierId" TEXT NOT NULL,
    "amount" DECIMAL(15,2) NOT NULL,
    "deliveryDate" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,
    "aiTrustScore" INTEGER NOT NULL DEFAULT 0,
    "status" VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "supplier_bids_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "requisitions_vendorId_idx" ON "requisitions"("vendorId");

-- CreateIndex
CREATE INDEX "requisitions_marketId_idx" ON "requisitions"("marketId");

-- CreateIndex
CREATE INDEX "requisitions_status_idx" ON "requisitions"("status");

-- CreateIndex
CREATE INDEX "requisitions_deadline_idx" ON "requisitions"("deadline");

-- CreateIndex
CREATE INDEX "requisition_items_requisitionId_idx" ON "requisition_items"("requisitionId");

-- CreateIndex
CREATE INDEX "supplier_bids_requisitionId_idx" ON "supplier_bids"("requisitionId");

-- CreateIndex
CREATE INDEX "supplier_bids_supplierId_idx" ON "supplier_bids"("supplierId");

-- CreateIndex
CREATE INDEX "supplier_bids_status_idx" ON "supplier_bids"("status");

-- AddForeignKey
ALTER TABLE "requisitions" ADD CONSTRAINT "requisitions_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "vendors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "requisitions" ADD CONSTRAINT "requisitions_marketId_fkey" FOREIGN KEY ("marketId") REFERENCES "markets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "requisition_items" ADD CONSTRAINT "requisition_items_requisitionId_fkey" FOREIGN KEY ("requisitionId") REFERENCES "requisitions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supplier_bids" ADD CONSTRAINT "supplier_bids_requisitionId_fkey" FOREIGN KEY ("requisitionId") REFERENCES "requisitions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supplier_bids" ADD CONSTRAINT "supplier_bids_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "suppliers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
