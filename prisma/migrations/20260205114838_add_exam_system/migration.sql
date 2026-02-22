-- CreateTable
CREATE TABLE "public"."ProctoringSession" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "examId" INTEGER,
    "examName" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'initialized',
    "faceEncodingData" TEXT,
    "studentPhotoUrl" TEXT,
    "totalQuestions" INTEGER,
    "correctAnswers" INTEGER,
    "score" DOUBLE PRECISION,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProctoringSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ProctoringViolation" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "violationType" TEXT NOT NULL,
    "severity" TEXT NOT NULL DEFAULT 'medium',
    "description" TEXT,
    "detectedObjects" TEXT[],
    "tabSwitchCount" INTEGER NOT NULL DEFAULT 0,
    "evidenceImageUrl" TEXT,
    "evidenceData" JSONB,
    "detectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "acknowledgedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProctoringViolation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ProctoringReport" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "reportTitle" TEXT NOT NULL,
    "examName" TEXT NOT NULL,
    "totalViolations" INTEGER NOT NULL DEFAULT 0,
    "highSeverity" INTEGER NOT NULL DEFAULT 0,
    "mediumSeverity" INTEGER NOT NULL DEFAULT 0,
    "lowSeverity" INTEGER NOT NULL DEFAULT 0,
    "quizScore" DOUBLE PRECISION,
    "timeSpent" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "reviewerNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProctoringReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Question" (
    "id" TEXT NOT NULL,
    "questionText" TEXT NOT NULL,
    "questionType" TEXT NOT NULL,
    "industry" TEXT,
    "difficulty" TEXT NOT NULL DEFAULT 'medium',
    "options" TEXT[],
    "correctAnswer" TEXT,
    "codeTemplate" TEXT,
    "expectedOutput" TEXT,
    "testCases" JSONB,
    "tags" TEXT[],
    "explanation" TEXT,
    "timeEstimate" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Question_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ProctoredExam" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "examTitle" TEXT NOT NULL,
    "industry" TEXT NOT NULL,
    "description" TEXT,
    "mcqCount" INTEGER NOT NULL DEFAULT 0,
    "codingCount" INTEGER NOT NULL DEFAULT 0,
    "subjectiveCount" INTEGER NOT NULL DEFAULT 0,
    "fillBlankCount" INTEGER NOT NULL DEFAULT 0,
    "totalDuration" INTEGER NOT NULL,
    "passingScore" DOUBLE PRECISION NOT NULL DEFAULT 60.0,
    "proctor" TEXT NOT NULL DEFAULT 'enabled',
    "status" TEXT NOT NULL DEFAULT 'draft',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProctoredExam_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ExamAttempt" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "examId" TEXT NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3),
    "timeSpent" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'in_progress',
    "totalScore" DOUBLE PRECISION,
    "percentageScore" DOUBLE PRECISION,
    "isPassing" BOOLEAN NOT NULL DEFAULT false,
    "answers" JSONB[],
    "violations" JSONB[],
    "flaggedForReview" BOOLEAN NOT NULL DEFAULT false,
    "reviewNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExamAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProctoringSession_userId_idx" ON "public"."ProctoringSession"("userId");

-- CreateIndex
CREATE INDEX "ProctoringSession_status_idx" ON "public"."ProctoringSession"("status");

-- CreateIndex
CREATE INDEX "ProctoringViolation_sessionId_idx" ON "public"."ProctoringViolation"("sessionId");

-- CreateIndex
CREATE INDEX "ProctoringViolation_violationType_idx" ON "public"."ProctoringViolation"("violationType");

-- CreateIndex
CREATE INDEX "ProctoringReport_userId_idx" ON "public"."ProctoringReport"("userId");

-- CreateIndex
CREATE INDEX "Question_questionType_idx" ON "public"."Question"("questionType");

-- CreateIndex
CREATE INDEX "Question_industry_idx" ON "public"."Question"("industry");

-- CreateIndex
CREATE INDEX "Question_difficulty_idx" ON "public"."Question"("difficulty");

-- CreateIndex
CREATE INDEX "ProctoredExam_userId_idx" ON "public"."ProctoredExam"("userId");

-- CreateIndex
CREATE INDEX "ProctoredExam_industry_idx" ON "public"."ProctoredExam"("industry");

-- CreateIndex
CREATE INDEX "ExamAttempt_userId_idx" ON "public"."ExamAttempt"("userId");

-- CreateIndex
CREATE INDEX "ExamAttempt_examId_idx" ON "public"."ExamAttempt"("examId");

-- CreateIndex
CREATE INDEX "ExamAttempt_status_idx" ON "public"."ExamAttempt"("status");

-- AddForeignKey
ALTER TABLE "public"."ProctoringSession" ADD CONSTRAINT "ProctoringSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProctoringViolation" ADD CONSTRAINT "ProctoringViolation_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "public"."ProctoringSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProctoringReport" ADD CONSTRAINT "ProctoringReport_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProctoredExam" ADD CONSTRAINT "ProctoredExam_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ExamAttempt" ADD CONSTRAINT "ExamAttempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ExamAttempt" ADD CONSTRAINT "ExamAttempt_examId_fkey" FOREIGN KEY ("examId") REFERENCES "public"."ProctoredExam"("id") ON DELETE CASCADE ON UPDATE CASCADE;
