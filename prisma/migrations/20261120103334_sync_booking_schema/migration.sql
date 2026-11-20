-- AlterTable
ALTER TABLE "booking" ADD COLUMN     "status" "BookingStatus" NOT NULL DEFAULT 'PENDING';

-- CreateIndex
CREATE INDEX "booking_status_idx" ON "booking"("status");
