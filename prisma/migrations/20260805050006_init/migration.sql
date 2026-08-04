-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "EntityType" AS ENUM ('SIGNAL', 'INTENT', 'EXPLORATION', 'EXPERIMENT', 'PROJECT_CANDIDATE', 'ACTIVE_PROJECT');

-- CreateEnum
CREATE TYPE "AttentionState" AS ENUM ('INBOX', 'ACTIVE', 'WAITING', 'DORMANT', 'CLOSED');

-- CreateEnum
CREATE TYPE "WorthyReadyNow" AS ENUM ('UNASSESSED', 'YES', 'NO');

-- CreateEnum
CREATE TYPE "FinalDecision" AS ENUM ('CONTINUE', 'CHANGE', 'STOP', 'HOLD');

-- CreateEnum
CREATE TYPE "ProjectSlot" AS ENUM ('MAJOR', 'MINOR');

-- CreateTable
CREATE TABLE "Signal" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "context" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "state" "AttentionState" NOT NULL DEFAULT 'INBOX',

    CONSTRAINT "Signal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Intent" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "approach" TEXT NOT NULL,
    "expectedChange" TEXT NOT NULL,
    "assumption" TEXT NOT NULL,
    "signalId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "state" "AttentionState" NOT NULL DEFAULT 'INBOX',

    CONSTRAINT "Intent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Exploration" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "unclearWhat" TEXT NOT NULL,
    "scope" TEXT NOT NULL,
    "budget" TEXT NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "stoppingCondition" TEXT NOT NULL,
    "expectedOutput" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "state" "AttentionState" NOT NULL DEFAULT 'INBOX',
    "signalId" TEXT,
    "intentId" TEXT,

    CONSTRAINT "Exploration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Experiment" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "decisionGoal" TEXT NOT NULL,
    "nextCommitment" TEXT NOT NULL,
    "criticalAssumption" TEXT NOT NULL,
    "testMethod" TEXT NOT NULL,
    "observableEvidence" TEXT NOT NULL,
    "budget" TEXT NOT NULL,
    "decisionDate" TIMESTAMP(3) NOT NULL,
    "finalDecision" "FinalDecision",
    "finalReasoning" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "state" "AttentionState" NOT NULL DEFAULT 'INBOX',
    "intentId" TEXT,
    "explorationId" TEXT,

    CONSTRAINT "Experiment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectCandidate" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "proposedOutcome" TEXT NOT NULL,
    "evidenceOfValue" TEXT NOT NULL,
    "primaryAlignment" TEXT NOT NULL,
    "acceptanceCriteria" TEXT NOT NULL,
    "constraints" TEXT NOT NULL,
    "roughEstimate" TEXT NOT NULL,
    "worthy" "WorthyReadyNow" NOT NULL DEFAULT 'UNASSESSED',
    "ready" "WorthyReadyNow" NOT NULL DEFAULT 'UNASSESSED',
    "now" "WorthyReadyNow" NOT NULL DEFAULT 'UNASSESSED',
    "worthyReason" TEXT,
    "readyReason" TEXT,
    "nowReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "state" "AttentionState" NOT NULL DEFAULT 'INBOX',
    "experimentId" TEXT,

    CONSTRAINT "ProjectCandidate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActiveProject" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "desiredOutcome" TEXT NOT NULL,
    "acceptanceCriteria" TEXT NOT NULL,
    "primaryAlignment" TEXT NOT NULL,
    "deadline" TIMESTAMP(3) NOT NULL,
    "realisticLeadTime" TEXT NOT NULL,
    "currentMilestone" TEXT NOT NULL,
    "nextConcreteAction" TEXT NOT NULL,
    "majorDependency" TEXT,
    "projectSlot" "ProjectSlot" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "state" "AttentionState" NOT NULL DEFAULT 'ACTIVE',
    "projectCandidateId" TEXT,

    CONSTRAINT "ActiveProject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transition" (
    "id" TEXT NOT NULL,
    "fromEntityId" TEXT,
    "toEntityId" TEXT,
    "fromType" "EntityType",
    "toType" "EntityType",
    "fromState" "AttentionState",
    "toState" "AttentionState",
    "reason" TEXT NOT NULL,
    "evidence" TEXT,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Transition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Relationship" (
    "id" TEXT NOT NULL,
    "fromId" TEXT NOT NULL,
    "toId" TEXT NOT NULL,
    "fromType" "EntityType" NOT NULL,
    "toType" "EntityType" NOT NULL,
    "role" TEXT NOT NULL,

    CONSTRAINT "Relationship_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ActiveProject_projectCandidateId_key" ON "ActiveProject"("projectCandidateId");

-- AddForeignKey
ALTER TABLE "Intent" ADD CONSTRAINT "Intent_signalId_fkey" FOREIGN KEY ("signalId") REFERENCES "Signal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Exploration" ADD CONSTRAINT "Exploration_signalId_fkey" FOREIGN KEY ("signalId") REFERENCES "Signal"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Exploration" ADD CONSTRAINT "Exploration_intentId_fkey" FOREIGN KEY ("intentId") REFERENCES "Intent"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Experiment" ADD CONSTRAINT "Experiment_intentId_fkey" FOREIGN KEY ("intentId") REFERENCES "Intent"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Experiment" ADD CONSTRAINT "Experiment_explorationId_fkey" FOREIGN KEY ("explorationId") REFERENCES "Exploration"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectCandidate" ADD CONSTRAINT "ProjectCandidate_experimentId_fkey" FOREIGN KEY ("experimentId") REFERENCES "Experiment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActiveProject" ADD CONSTRAINT "ActiveProject_projectCandidateId_fkey" FOREIGN KEY ("projectCandidateId") REFERENCES "ProjectCandidate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

