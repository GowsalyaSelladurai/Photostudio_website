CREATE TABLE "Booking" (
    "id" TEXT NOT NULL,
    "referenceNumber" SERIAL NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "mobile" VARCHAR(32) NOT NULL,
    "shootType" VARCHAR(80) NOT NULL,
    "startsAt" TIMESTAMPTZ(3) NOT NULL,
    "location" VARCHAR(300) NOT NULL,
    "requirements" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Booking_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Enquiry" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "email" VARCHAR(254),
    "mobile" VARCHAR(32),
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Enquiry_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Booking_referenceNumber_key" ON "Booking"("referenceNumber");
CREATE UNIQUE INDEX "Booking_startsAt_key" ON "Booking"("startsAt");
CREATE INDEX "Booking_createdAt_idx" ON "Booking"("createdAt");
CREATE INDEX "Enquiry_createdAt_idx" ON "Enquiry"("createdAt");
