-- DropIndex
DROP INDEX "Car_price_year_idx";

-- CreateIndex
CREATE INDEX "Car_price_year_idx" ON "Car"("price", "year");
