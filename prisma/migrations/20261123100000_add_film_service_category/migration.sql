-- Film/Video services support for the existing Enquiry and Book Now flows.
-- Additive only: no existing columns, tables or rows are changed or dropped.

-- CreateEnum
CREATE TYPE "ServiceCategory" AS ENUM ('PHOTOGRAPHY', 'FILM');

-- AlterTable: existing bookings are classified as PHOTOGRAPHY by the default.
ALTER TABLE "booking" ADD COLUMN "serviceCategory" "ServiceCategory" NOT NULL DEFAULT 'PHOTOGRAPHY';

-- AlterTable: service is optional on enquiries (NULL = general enquiry).
ALTER TABLE "enquiry" ADD COLUMN "serviceType" VARCHAR(80),
ADD COLUMN "serviceCategory" "ServiceCategory";

-- CreateIndex
CREATE INDEX "booking_service_category_idx" ON "booking"("serviceCategory");

-- CreateIndex
CREATE INDEX "enquiry_service_category_idx" ON "enquiry"("serviceCategory");
