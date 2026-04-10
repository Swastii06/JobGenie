import { getAssessments } from "@/actions/interview";
import StatsCards from "./_components/stats-cards";
import PerformanceChart from "./_components/performance-chart";
import QuizList from "./_components/quiz-list";
import ExamConfigurationWrapper from "./take-exam/_components/exam-configuration-wrapper";
import { BookOpen, Zap, TrendingUp } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

// Force dynamic rendering - don't attempt static generation at build time
export const dynamic = 'force-dynamic';

export default async function InterviewPrepPage() {
  const assessments = await getAssessments();

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="space-y-3 mb-8">
        <h1 className="text-5xl md:text-6xl font-bold gradient-title">
          Interview Preparation Center
        </h1>
        <p className="text-lg text-muted-foreground max-w-3xl">
          Ace your interviews with comprehensive practice tools. Choose between quick mock quizzes or complete custom exams with proctoring.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-6">
        <StatsCards assessments={assessments} />
      </div>

      {/* Two Options - Mock Quizzes and Custom Exams (Coding Integrated) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Mock Quizzes Option */}
        <Card className="overflow-hidden border-2 hover:border-blue-400/50 transition-all duration-300 flex flex-col">
          <div className="h-24 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 flex items-center justify-center">
            <BookOpen className="w-12 h-12 text-blue-600 opacity-30" />
          </div>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-2xl">
              <BookOpen className="w-6 h-6 text-blue-600" />
              Mock Quizzes
            </CardTitle>
            <CardDescription className="text-base">
              Quick practice with instant feedback
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col space-y-4">
            <ul className="space-y-3 text-sm flex-1">
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold mt-0.5">✓</span>
                <span>AI-generated questions on any topic</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold mt-0.5">✓</span>
                <span>Get instant feedback and explanations</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold mt-0.5">✓</span>
                <span>Track progress with detailed analytics</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold mt-0.5">✓</span>
                <span>Take unlimited quizzes</span>
              </li>
            </ul>
            <Link href="/interview/mock" className="w-full">
              <Button className="w-full bg-blue-600 hover:bg-blue-700">
                Start a Quiz
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Custom Exams with Integrated Coding */}
        <Card className="overflow-hidden border-2 hover:border-purple-400/50 transition-all duration-300 flex flex-col">
          <div className="h-24 bg-gradient-to-br from-purple-500/10 to-pink-500/10 flex items-center justify-center">
            <Zap className="w-12 h-12 text-purple-600 opacity-30" />
          </div>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Zap className="w-6 h-6 text-purple-600" />
              Custom Exams
            </CardTitle>
            <CardDescription className="text-base">
              Full exams with coding + proctoring
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col space-y-4">
            <ul className="space-y-3 text-sm flex-1">
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold mt-0.5">✓</span>
                <span>MCQ, Coding, and Subjective questions</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold mt-0.5">✓</span>
                <span>9+ programming languages with real-time compiler</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold mt-0.5">✓</span>
                <span>Multiple test cases with detailed feedback</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold mt-0.5">✓</span>
                <span>AI-powered proctoring + comprehensive reports</span>
              </li>
            </ul>
            <Link href="/interview/take-exam" className="w-full">
              <Button className="w-full bg-purple-600 hover:bg-purple-700">
                Create Custom Exam
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Recent Quizzes Section */}
      {assessments && assessments.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">Recent Activity</CardTitle>
                <CardDescription>Your recent quizzes and exams</CardDescription>
              </div>
              <Link href="/interview/history">
                <Button variant="outline" size="sm">
                  View all history
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <QuizList assessments={assessments} />
          </CardContent>
        </Card>
      )}

      {/* Performance Analytics */}
      <div className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-primary" />
            Your Performance
          </h2>
          <p className="text-muted-foreground">
            View your progress and improvement areas
          </p>
        </div>
        <PerformanceChart assessments={assessments} />
      </div>
    </div>
  );
}