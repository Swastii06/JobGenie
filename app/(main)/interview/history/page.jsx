import { getAssessments } from "@/actions/interview";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

export default async function InterviewHistoryPage() {
  const assessments = await getAssessments();

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold gradient-title">Interview History</h1>
        <p className="text-muted-foreground">
          All your past mock quizzes and custom exams in one place.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Attempts</CardTitle>
          <CardDescription>
            Latest attempts are shown first. Scores are percentages.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {assessments && assessments.length > 0 ? (
            <div className="space-y-2 max-h-[480px] overflow-y-auto">
              {assessments.map((a) => (
                <div
                  key={a.id}
                  className="flex items-center justify-between rounded-md border px-4 py-3 text-sm"
                >
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">
                        {a.source === "exam" ? a.examTitle || "Custom Exam" : "Mock Quiz"}
                      </span>
                      <Badge variant="outline">
                        {a.source === "exam" ? "Exam" : "Quiz"}
                      </Badge>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(a.createdAt), "MMM dd, yyyy • HH:mm")}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-green-600">
                      {a.quizScore.toFixed(1)}%
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {a.questions?.length || 0} questions
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No history yet. Start a mock quiz or custom exam to see your progress here.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

