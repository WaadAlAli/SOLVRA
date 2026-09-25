/*
  Warnings:

  - Added the required column `title` to the `SolarRequest` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Currency" AS ENUM ('USD', 'LBP');

-- CreateEnum
CREATE TYPE "RoofType" AS ENUM ('FLAT', 'SLOPED', 'GROUND', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "PropertyOwnership" AS ENUM ('OWNED', 'RENTED', 'OTHER');

-- CreateEnum
CREATE TYPE "RequestPriority" AS ENUM ('LOWEST_PRICE', 'BALANCED', 'QUALITY', 'RELIABILITY');

-- CreateEnum
CREATE TYPE "TargetTimeline" AS ENUM ('ASAP', 'ONE_TO_THREE_MONTHS', 'THREE_TO_SIX_MONTHS', 'SIX_TO_TWELVE_MONTHS', 'FLEXIBLE');

-- AlterTable
ALTER TABLE "SolarRequest" ADD COLUMN     "averageMonthlyConsumption" DECIMAL(14,2),
ADD COLUMN     "currency" "Currency",
ADD COLUMN     "monthlyElectricityBill" DECIMAL(14,2),
ADD COLUMN     "ownership" "PropertyOwnership",
ADD COLUMN     "priority" "RequestPriority",
ADD COLUMN     "roofType" "RoofType",
ADD COLUMN     "timeline" "TargetTimeline",
ADD COLUMN     "title" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "SolarRequest_buyerId_idx" ON "SolarRequest"("buyerId");

-- CreateIndex
CREATE INDEX "SolarRequest_status_idx" ON "SolarRequest"("status");

-- CreateIndex
CREATE INDEX "SolarRequest_createdAt_idx" ON "SolarRequest"("createdAt");
