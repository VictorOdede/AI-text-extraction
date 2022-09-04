-- CreateTable
CREATE TABLE "mpesaStatements" (
    "id" SERIAL NOT NULL,
    "receipt" TEXT NOT NULL,
    "time" TEXT NOT NULL,
    "details" TEXT NOT NULL,
    "status" TEXT,
    "moneyIn" TEXT,
    "moneyOut" TEXT,
    "balance" TEXT,

    CONSTRAINT "mpesaStatements_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "mpesaStatements_receipt_key" ON "mpesaStatements"("receipt");
