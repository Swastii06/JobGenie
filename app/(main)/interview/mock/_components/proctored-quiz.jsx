// app/(main)/interview/mock/_components/proctored-quiz.jsx
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Quiz from "../../_components/quiz";

export default function ProctoredQuiz() {
  // Mock quiz now defaults to non-proctored mode.
  return (
    <Card>
      <CardHeader>
        <CardTitle>Mock Quiz</CardTitle>
        <CardDescription>Test your knowledge with industry-specific questions</CardDescription>
      </CardHeader>
      <CardContent>
        <Quiz />
      </CardContent>
    </Card>
  );
}
