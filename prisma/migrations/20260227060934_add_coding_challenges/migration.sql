-- CreateTable
CREATE TABLE "public"."CodingChallenge" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL DEFAULT 'medium',
    "category" TEXT NOT NULL,
    "languages" TEXT[],
    "codeTemplates" JSONB NOT NULL,
    "testCases" JSONB NOT NULL,
    "constraints" TEXT,
    "examples" JSONB,
    "tags" TEXT[],
    "acceptance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "submissionCount" INTEGER NOT NULL DEFAULT 0,
    "editorial" TEXT,
    "hints" TEXT[],
    "solutions" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CodingChallenge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CodeSubmission" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "challengeId" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "verdict" TEXT NOT NULL DEFAULT 'pending',
    "message" TEXT,
    "passedTests" INTEGER NOT NULL DEFAULT 0,
    "totalTests" INTEGER NOT NULL DEFAULT 0,
    "executionTime" DOUBLE PRECISION,
    "memoryUsed" DOUBLE PRECISION,
    "testResults" JSONB NOT NULL,
    "submissionTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CodeSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CodingChallenge_difficulty_idx" ON "public"."CodingChallenge"("difficulty");

-- CreateIndex
CREATE INDEX "CodingChallenge_category_idx" ON "public"."CodingChallenge"("category");

-- CreateIndex
CREATE INDEX "CodeSubmission_userId_idx" ON "public"."CodeSubmission"("userId");

-- CreateIndex
CREATE INDEX "CodeSubmission_challengeId_idx" ON "public"."CodeSubmission"("challengeId");

-- CreateIndex
CREATE INDEX "CodeSubmission_verdict_idx" ON "public"."CodeSubmission"("verdict");

-- CreateIndex
CREATE INDEX "CodeSubmission_submissionTime_idx" ON "public"."CodeSubmission"("submissionTime");

-- AddForeignKey
ALTER TABLE "public"."CodeSubmission" ADD CONSTRAINT "CodeSubmission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CodeSubmission" ADD CONSTRAINT "CodeSubmission_challengeId_fkey" FOREIGN KEY ("challengeId") REFERENCES "public"."CodingChallenge"("id") ON DELETE CASCADE ON UPDATE CASCADE;
