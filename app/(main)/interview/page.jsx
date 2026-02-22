import { getAssessments } from "@/actions/interview";
import StatsCards from "./_components/stats-cards";
import PerformanceChart from "./_components/performance-chart";
import QuizList from "./_components/quiz-list";
import ExamConfigurationWrapper from "./take-exam/_components/exam-configuration-wrapper";
import { BookOpen, Zap, TrendingUp, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function InterviewPrepPage() {
  const assessments = await getAssessments();

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="space-y-2 mb-8">
        <h1 className="text-5xl md:text-6xl font-bold gradient-title">
          Interview Preparation Center
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl">
          Master your skills with comprehensive mock quizzes and custom exams. Practice, analyze, and excel in your interviews.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-6">
        <StatsCards assessments={assessments} />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Mock Quizzes Section */}
        <Card className="lg:col-span-1 overflow-hidden border-2 hover:border-primary/50 transition-colors">
          <div className="h-32 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 flex items-center justify-center">
            <BookOpen className="w-16 h-16 text-blue-600 opacity-20" />
          </div>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-2xl">
              <BookOpen className="w-6 h-6 text-blue-600" />
              Mock Quizzes
            </CardTitle>
            <CardDescription>
              Practice with unlimited AI-generated quizzes
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <span>Instantly generated questions</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <span>Instant AI feedback</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <span>Track your progress</span>
              </li>
            </ul>
            <QuizList assessments={assessments} />
          </CardContent>
        </Card>

        {/* Custom Exams Section */}
        <Card className="lg:col-span-1 overflow-hidden border-2 hover:border-primary/50 transition-colors">
          <div className="h-32 bg-gradient-to-br from-amber-500/10 to-orange-500/10 flex items-center justify-center">
            <Zap className="w-16 h-16 text-amber-600 opacity-20" />
          </div>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Zap className="w-6 h-6 text-amber-600" />
              Custom Exams
            </CardTitle>
            <CardDescription>
              Create and take personalized exams with proctoring
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm mb-6">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <span>Custom questions</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <span>AI proctoring enabled</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <span>Detailed analytics</span>
              </li>
            </ul>
            <ExamConfigurationWrapper />
          </CardContent>
        </Card>
      </div>

      {/* Performance Analytics */}
      <div className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-primary" />
            Your Performance
          </h2>
          <p className="text-muted-foreground">
            View your progress and areas for improvement
          </p>
        </div>
        <PerformanceChart assessments={assessments} />
      </div>
    </div>
  );
}