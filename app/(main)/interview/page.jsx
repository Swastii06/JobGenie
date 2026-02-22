import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getAssessments } from "@/actions/interview";
import StatsCards from "./_components/stats-cards";
import PerformanceChart from "./_components/performance-chart";
import QuizList from "./_components/quiz-list";
import ExamConfigurationWrapper from "./take-exam/_components/exam-configuration-wrapper";
import { BookOpen, Zap } from "lucide-react";

export default async function InterviewPrepPage() {
  const assessments = await getAssessments();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-6xl font-bold gradient-title">
          Interview Prep
        </h1>
      </div>

      <Tabs defaultValue="mock" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="mock" className="flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            Mock Quiz
          </TabsTrigger>
          <TabsTrigger value="take-exam" className="flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Take Custom Exam
          </TabsTrigger>
        </TabsList>

        <TabsContent value="mock" className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold">Practice with Mock Quizzes</h2>
            <p className="text-muted-foreground">
              Take unlimited mock quizzes to practice and improve your skills
            </p>
          </div>
          <div className="space-y-6">
            <StatsCards assessments={assessments} />
            <PerformanceChart assessments={assessments} />
            <QuizList assessments={assessments} />
          </div>
        </TabsContent>

        <TabsContent value="take-exam">
          <div className="space-y-6">
            <ExamConfigurationWrapper />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}