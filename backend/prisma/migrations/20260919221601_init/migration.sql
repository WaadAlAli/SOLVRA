-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('BUYER', 'SUPPLIER', 'ADMIN');

-- CreateEnum
CREATE TYPE "BuyerType" AS ENUM ('INDIVIDUAL', 'BUSINESS', 'INSTITUTION');

-- CreateEnum
CREATE TYPE "PropertyType" AS ENUM ('RESIDENTIAL', 'COMMERCIAL', 'INSTITUTIONAL');

-- CreateEnum
CREATE TYPE "RequestStatus" AS ENUM ('DRAFT', 'OPEN', 'EVALUATING', 'NEGOTIATING', 'AWARDED', 'CLOSED');

-- CreateEnum
CREATE TYPE "EvaluationCriterionType" AS ENUM ('PRICE', 'TECHNICAL_COMPLIANCE', 'WARRANTY', 'DELIVERY', 'MAINTENANCE', 'PAYMENT_TERMS', 'CUSTOM');

-- CreateEnum
CREATE TYPE "BidStatus" AS ENUM ('SUBMITTED', 'UNDER_NEGOTIATION', 'REVISED', 'NON_COMPLIANT', 'AWARDED', 'REJECTED', 'WITHDRAWN');

-- CreateEnum
CREATE TYPE "ExtractionSource" AS ENUM ('MANUAL_ENTRY', 'AI_EXTRACTED');

-- CreateEnum
CREATE TYPE "BidDocumentType" AS ENUM ('PDF', 'XLSX');

-- CreateEnum
CREATE TYPE "NegotiationStatus" AS ENUM ('OPEN', 'RESOLVED', 'CLOSED');

-- CreateEnum
CREATE TYPE "NegotiationAuthorType" AS ENUM ('BUYER', 'SUPPLIER', 'AI_SUGGESTION');

-- CreateEnum
CREATE TYPE "ActivityAction" AS ENUM ('REQUEST_CREATED', 'BID_SUBMITTED', 'BID_REVISED', 'WEIGHTS_SET', 'EVALUATION_RUN', 'NEGOTIATION_MESSAGE_SENT', 'WHAT_IF_RUN', 'AWARD_MADE', 'REQUEST_UPDATED', 'REQUEST_STATUS_CHANGED', 'BID_WITHDRAWN', 'BID_REJECTED', 'SUPPLIER_VERIFIED', 'USER_DEACTIVATED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BuyerProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "buyerType" "BuyerType" NOT NULL,
    "displayName" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "phone" TEXT,

    CONSTRAINT "BuyerProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SupplierProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "serviceAreas" TEXT[],
    "capabilities" TEXT[],
    "certifications" TEXT,
    "verifiedByAdmin" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "SupplierProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SolarRequest" (
    "id" TEXT NOT NULL,
    "buyerId" TEXT NOT NULL,
    "propertyType" "PropertyType" NOT NULL,
    "location" TEXT NOT NULL,
    "status" "RequestStatus" NOT NULL DEFAULT 'DRAFT',
    "budget" DECIMAL(14,2),
    "rawDescription" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SolarRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RequirementProfile" (
    "id" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "occupantsOrUsers" INTEGER,
    "acUnitsCount" INTEGER,
    "applianceLoad" JSONB,
    "usagePattern" JSONB,
    "backupRequired" BOOLEAN NOT NULL DEFAULT false,
    "currentElectricitySituation" TEXT,
    "goals" TEXT[],
    "preferences" TEXT,
    "extractionConfidence" DECIMAL(5,4),
    "confirmedByBuyer" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "RequirementProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EvaluationCriterion" (
    "id" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "name" "EvaluationCriterionType" NOT NULL,
    "weightPercent" DECIMAL(5,2) NOT NULL,

    CONSTRAINT "EvaluationCriterion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Bid" (
    "id" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "supplierId" TEXT NOT NULL,
    "status" "BidStatus" NOT NULL DEFAULT 'SUBMITTED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Bid_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BidVersion" (
    "id" TEXT NOT NULL,
    "bidId" TEXT NOT NULL,
    "versionNumber" INTEGER NOT NULL,
    "panelCapacityKw" DECIMAL(12,3) NOT NULL,
    "batteryCapacityKwh" DECIMAL(12,3),
    "batteryType" TEXT,
    "inverterSpec" TEXT,
    "equipmentDetails" JSONB,
    "installationCost" DECIMAL(14,2) NOT NULL,
    "deliveryCost" DECIMAL(14,2) NOT NULL,
    "commissioningCost" DECIMAL(14,2) NOT NULL,
    "maintenanceCost" DECIMAL(14,2),
    "warrantyYears" INTEGER,
    "deliveryTimeDays" INTEGER,
    "paymentTerms" TEXT,
    "totalPrice" DECIMAL(14,2) NOT NULL,
    "extractionSource" "ExtractionSource" NOT NULL,
    "extractionConfirmed" BOOLEAN NOT NULL DEFAULT false,
    "changeSummary" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BidVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BidDocument" (
    "id" TEXT NOT NULL,
    "bidVersionId" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileType" "BidDocumentType" NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BidDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EvaluationResult" (
    "id" TEXT NOT NULL,
    "bidVersionId" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "tcoAmount" DECIMAL(14,2) NOT NULL,
    "criterionScores" JSONB,
    "weightedTotalScore" DECIMAL(8,4) NOT NULL,
    "rank" INTEGER NOT NULL,
    "isCompliant" BOOLEAN NOT NULL,
    "computedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EvaluationResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Negotiation" (
    "id" TEXT NOT NULL,
    "bidId" TEXT NOT NULL,
    "status" "NegotiationStatus" NOT NULL DEFAULT 'OPEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Negotiation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NegotiationMessage" (
    "id" TEXT NOT NULL,
    "negotiationId" TEXT NOT NULL,
    "senderId" TEXT,
    "authorType" "NegotiationAuthorType" NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NegotiationMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WhatIfScenario" (
    "id" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "bidVersionId" TEXT NOT NULL,
    "runByUserId" TEXT NOT NULL,
    "parameters" JSONB NOT NULL,
    "hypotheticalResult" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WhatIfScenario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Award" (
    "id" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "bidVersionId" TEXT NOT NULL,
    "awardedByUserId" TEXT NOT NULL,
    "awardedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Award_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActivityLog" (
    "id" TEXT NOT NULL,
    "actorId" TEXT,
    "requestId" TEXT,
    "bidId" TEXT,
    "action" "ActivityAction" NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ActivityLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "BuyerProfile_userId_key" ON "BuyerProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "SupplierProfile_userId_key" ON "SupplierProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "RequirementProfile_requestId_key" ON "RequirementProfile"("requestId");

-- CreateIndex
CREATE INDEX "EvaluationCriterion_requestId_idx" ON "EvaluationCriterion"("requestId");

-- CreateIndex
CREATE INDEX "Bid_requestId_idx" ON "Bid"("requestId");

-- CreateIndex
CREATE INDEX "Bid_supplierId_idx" ON "Bid"("supplierId");

-- CreateIndex
CREATE UNIQUE INDEX "Bid_requestId_supplierId_key" ON "Bid"("requestId", "supplierId");

-- CreateIndex
CREATE INDEX "BidVersion_bidId_idx" ON "BidVersion"("bidId");

-- CreateIndex
CREATE UNIQUE INDEX "BidVersion_bidId_versionNumber_key" ON "BidVersion"("bidId", "versionNumber");

-- CreateIndex
CREATE INDEX "BidDocument_bidVersionId_idx" ON "BidDocument"("bidVersionId");

-- CreateIndex
CREATE INDEX "EvaluationResult_requestId_idx" ON "EvaluationResult"("requestId");

-- CreateIndex
CREATE INDEX "EvaluationResult_bidVersionId_idx" ON "EvaluationResult"("bidVersionId");

-- CreateIndex
CREATE INDEX "Negotiation_bidId_idx" ON "Negotiation"("bidId");

-- CreateIndex
CREATE INDEX "NegotiationMessage_negotiationId_idx" ON "NegotiationMessage"("negotiationId");

-- CreateIndex
CREATE INDEX "NegotiationMessage_senderId_idx" ON "NegotiationMessage"("senderId");

-- CreateIndex
CREATE INDEX "WhatIfScenario_requestId_idx" ON "WhatIfScenario"("requestId");

-- CreateIndex
CREATE INDEX "WhatIfScenario_bidVersionId_idx" ON "WhatIfScenario"("bidVersionId");

-- CreateIndex
CREATE INDEX "WhatIfScenario_runByUserId_idx" ON "WhatIfScenario"("runByUserId");

-- CreateIndex
CREATE UNIQUE INDEX "Award_requestId_key" ON "Award"("requestId");

-- CreateIndex
CREATE INDEX "Award_awardedByUserId_idx" ON "Award"("awardedByUserId");

-- CreateIndex
CREATE UNIQUE INDEX "Award_bidVersionId_key" ON "Award"("bidVersionId");

-- CreateIndex
CREATE INDEX "ActivityLog_actorId_idx" ON "ActivityLog"("actorId");

-- CreateIndex
CREATE INDEX "ActivityLog_requestId_idx" ON "ActivityLog"("requestId");

-- CreateIndex
CREATE INDEX "ActivityLog_bidId_idx" ON "ActivityLog"("bidId");

-- CreateIndex
CREATE INDEX "ActivityLog_createdAt_idx" ON "ActivityLog"("createdAt");

-- AddForeignKey
ALTER TABLE "BuyerProfile" ADD CONSTRAINT "BuyerProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupplierProfile" ADD CONSTRAINT "SupplierProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SolarRequest" ADD CONSTRAINT "SolarRequest_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "BuyerProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RequirementProfile" ADD CONSTRAINT "RequirementProfile_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "SolarRequest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvaluationCriterion" ADD CONSTRAINT "EvaluationCriterion_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "SolarRequest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bid" ADD CONSTRAINT "Bid_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "SolarRequest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bid" ADD CONSTRAINT "Bid_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "SupplierProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BidVersion" ADD CONSTRAINT "BidVersion_bidId_fkey" FOREIGN KEY ("bidId") REFERENCES "Bid"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BidDocument" ADD CONSTRAINT "BidDocument_bidVersionId_fkey" FOREIGN KEY ("bidVersionId") REFERENCES "BidVersion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvaluationResult" ADD CONSTRAINT "EvaluationResult_bidVersionId_fkey" FOREIGN KEY ("bidVersionId") REFERENCES "BidVersion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvaluationResult" ADD CONSTRAINT "EvaluationResult_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "SolarRequest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Negotiation" ADD CONSTRAINT "Negotiation_bidId_fkey" FOREIGN KEY ("bidId") REFERENCES "Bid"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NegotiationMessage" ADD CONSTRAINT "NegotiationMessage_negotiationId_fkey" FOREIGN KEY ("negotiationId") REFERENCES "Negotiation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NegotiationMessage" ADD CONSTRAINT "NegotiationMessage_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WhatIfScenario" ADD CONSTRAINT "WhatIfScenario_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "SolarRequest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WhatIfScenario" ADD CONSTRAINT "WhatIfScenario_bidVersionId_fkey" FOREIGN KEY ("bidVersionId") REFERENCES "BidVersion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WhatIfScenario" ADD CONSTRAINT "WhatIfScenario_runByUserId_fkey" FOREIGN KEY ("runByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Award" ADD CONSTRAINT "Award_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "SolarRequest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Award" ADD CONSTRAINT "Award_bidVersionId_fkey" FOREIGN KEY ("bidVersionId") REFERENCES "BidVersion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Award" ADD CONSTRAINT "Award_awardedByUserId_fkey" FOREIGN KEY ("awardedByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityLog" ADD CONSTRAINT "ActivityLog_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityLog" ADD CONSTRAINT "ActivityLog_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "SolarRequest"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityLog" ADD CONSTRAINT "ActivityLog_bidId_fkey" FOREIGN KEY ("bidId") REFERENCES "Bid"("id") ON DELETE SET NULL ON UPDATE CASCADE;
