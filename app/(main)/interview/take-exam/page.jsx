"use client";

import ExamConfigurationWrapper from "./_components/exam-configuration-wrapper";

// Force dynamic rendering - prevent static generation with Clerk headers
export const dynamic = 'force-dynamic';

export default function TakeExamPage() {
  return (
    <div className="space-y-6">
      <ExamConfigurationWrapper />
    </div>
  );
}
