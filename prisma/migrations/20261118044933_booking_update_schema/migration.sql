/*
  Warnings:

  - You are about to drop the `Booking` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Enquiry` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('PENDING', 'CONFIRMED', 'CANCELLED');

-- DropTable
DROP TABLE "Booking";

-- DropTable
DROP TABLE "Enquiry";

-- CreateTable
CREATE TABLE "booking" (
    "id" TEXT NOT NULL,
    "referenceNumber" SERIAL NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "mobile" VARCHAR(32) NOT NULL,
    "shootType" VARCHAR(80) NOT NULL,
    "startsAt" TIMESTAMPTZ(3) NOT NULL,
    "location" VARCHAR(300) NOT NULL,
    "requirements" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "booking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "enquiry" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "email" VARCHAR(254),
    "mobile" VARCHAR(32),
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "enquiry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "booking_referenceNumber_key" ON "booking"("referenceNumber");

-- CreateIndex
CREATE UNIQUE INDEX "booking_startsAt_key" ON "booking"("startsAt");

-- CreateIndex
CREATE INDEX "booking_created_at_idx" ON "booking"("createdAt");

-- CreateIndex
CREATE INDEX "enquiry_created_at_idx" ON "enquiry"("createdAt");
