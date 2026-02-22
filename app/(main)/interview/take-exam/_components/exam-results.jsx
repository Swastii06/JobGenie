"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, Clock, BarChart3, AlertTriangle, Download, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

export default function ExamResults({ examAttempt, onRetake }) {
  const { 
    totalScore, 
    percentageScore, 
    correctAnswers, 
    totalQuestions, 
    timeSpent, 
    questions, 
    violations = [],
    tabSwitches,
    proctoringEnabled 
  } = examAttempt;
  
  const [showSolutions, setShowSolutions] = useState({});
  const isPassing = percentageScore >= 60;
  const minutes = Math.floor(timeSpent / 60);
  const seconds = timeSpent % 60;

  const handleDownloadReport = () => {
    try {
      // Create CSV content
      let csvContent = "Exam Results Report\n";
      csvContent += `Date: ${new Date().toLocaleString()}\n`;
      csvContent += `Overall Score: ${totalScore} / ${totalQuestions * 2}\n`;
      csvContent += `Percentage: ${percentageScore}%\n`;
      csvContent += `Status: ${isPassing ? "PASS" : "FAIL"}\n`;
      csvContent += `Time Taken: ${minutes}:${seconds.toString().padStart(2, "0")}\n\n`;

      if (proctoringEnabled && tabSwitches > 0) {
        csvContent += `Violations Detected: ${tabSwitches}\n\n`;
      }

      csvContent += "Question-by-Question Analysis\n";
      csvContent += "Question Number,Type,Your Answer,Correct Answer,Status\n";

      questions.forEach((q, idx) => {
        csvContent += `${idx + 1},"${q.questionType}","${q.userAnswer || "N/A"}","${q.correctAnswer || "N/A"}","${q.isCorrect ? "Correct" : "Incorrect"}"\n`;
      });

      // Download as text file
      const element = document.createElement("a");
      element.setAttribute("href", "data:text/csv;charset=utf-8," + encodeURIComponent(csvContent));
      element.setAttribute("download", `exam-report-${new Date().toISOString().split('T')[0]}.csv`);
      element.click();
      
      toast.success("✅ Report downloaded successfully!");
    } catch (error) {
      toast.error("❌ Failed to download report");
    }
  };

  return (
    <div className="space-y-6">
      {/* Score Card */}
      <Card className={`${isPassing ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}`}>
        <CardContent className="pt-8">
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              {isPassing ? (
                <CheckCircle2 className="w-16 h-16 text-green-600" />
              ) : (
                <XCircle className="w-16 h-16 text-red-600" />
              )}
            </div>
            <h2 className={`text-3xl font-bold ${isPassing ? "text-green-600" : "text-red-600"}`}>
              {isPassing ? "Congratulations!" : "Review Required"}
            </h2>
            <p className="text-muted-foreground">
              {isPassing ? "You passed the exam!" : "You need to score higher to pass."}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Score Breakdown */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalScore}</div>
            <p className="text-xs text-muted-foreground">Total marks</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Percentage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{percentageScore}%</div>
            <Progress value={percentageScore} className="mt-2 h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Accuracy</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round((correctAnswers / totalQuestions) * 100)}%</div>
            <p className="text-xs text-muted-foreground">{correctAnswers} of {totalQuestions}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1">
              <Clock className="w-4 h-4" />
              Time Taken
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{minutes}:{seconds.toString().padStart(2, "0")}</div>
            <p className="text-xs text-muted-foreground">Total duration</p>
          </CardContent>
        </Card>
      </div>

      {/* Proctoring Violations */}
        {proctoringEnabled && violations && violations.length > 0 && (
          <Card className="border-orange-200 bg-orange-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-900">
                <AlertTriangle className="w-5 h-5" />
                Proctoring Violations Detected ({violations.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {violations.map((v, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div className="flex-1">
                      <div className="font-semibold">{v.type}</div>
                      <div className="text-sm text-muted-foreground">{v.details}</div>
                      <div className="text-xs text-muted-foreground">{new Date(v.timestamp).toLocaleString()}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm">Confidence: {v.confidence || 'N/A'}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Violation Snapshots (images) */}
        {proctoringEnabled && violations && violations.some(v => v.snapshot) && (
          <Card>
            <CardHeader>
              <CardTitle>Violation Snapshots</CardTitle>
              <CardDescription>Images captured at violation timestamps</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                {violations.filter(v => v.snapshot).map((v, i) => (
                  <div key={i} className="space-y-2 border rounded p-2">
                    <img src={v.snapshot} alt={`violation-${i}`} className="w-full h-40 object-cover rounded" />
                    <div className="text-xs text-muted-foreground">{v.type} — {new Date(v.timestamp).toLocaleString()}</div>
                    <div className="flex gap-2 mt-2">
                      <a href={v.snapshot} download={`violation-${i}.jpg`} className="text-sm text-blue-600">Download</a>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

      {/* Detailed Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Detailed Analysis
          </CardTitle>
          <CardDescription>Review your answers and performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {questions.map((question, idx) => (
              <div key={question.questionId} className={`border-l-4 pl-4 py-3 rounded ${
                question.isCorrect ? "border-l-green-500 bg-green-50" : "border-l-red-500 bg-red-50"
              }`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-semibold">
                      Q{idx + 1}. {question.questionText}
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <Badge variant="outline">
                        {question.questionType === "MCQ" && "Multiple Choice"}
                        {question.questionType === "CODING" && "Coding"}
                        {question.questionType === "SUBJECTIVE" && "Subjective"}
                        {question.questionType === "FILL_BLANK" && "Fill Blank"}
                      </Badge>
                      {question.questionType === "MCQ" || question.questionType === "FILL_BLANK" ? (
                        question.isCorrect ? (
                          <Badge className="bg-green-100 text-green-900">✓ Correct</Badge>
                        ) : (
                          <Badge className="bg-red-100 text-red-900">✗ Incorrect</Badge>
                        )
                      ) : (
                        <Badge className="bg-blue-100 text-blue-900">Pending Review</Badge>
                      )}
                    </div>
                  </div>
                </div>

                {question.userAnswer && (
                  <div className="mt-3 bg-white p-3 rounded text-sm border">
                    <p className="font-semibold text-blue-900">Your Answer:</p>
                    <p className="text-muted-foreground mt-1 whitespace-pre-wrap">
                      {question.userAnswer.substring(0, 200)}{question.userAnswer.length > 200 ? "..." : ""}
                    </p>
                  </div>
                )}

                {question.correctAnswer && question.questionType !== "SUBJECTIVE" && (
                  <div className="mt-2 bg-white p-3 rounded text-sm border">
                    <p className="font-semibold text-green-900">Correct Answer:</p>
                    <p className="text-muted-foreground mt-1">{question.correctAnswer}</p>
                  </div>
                )}

                {question.explanation && (
                  <div className="mt-2 bg-blue-50 p-3 rounded text-sm border-l-2 border-blue-500">
                    <p className="font-semibold text-blue-900">💡 Explanation:</p>
                    <p className="text-blue-800 mt-1">{question.explanation}</p>
                  </div>
                )}

                {question.solution && (
                  <div className="mt-2">
                    <button
                      onClick={() => setShowSolutions(prev => ({
                        ...prev,
                        [question.questionId]: !prev[question.questionId]
                      }))}
                      className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 font-semibold"
                    >
                      {showSolutions[question.questionId] ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                      {showSolutions[question.questionId] ? "Hide" : "Show"} Solution
                    </button>

                    {showSolutions[question.questionId] && (
                      <div className="mt-2 bg-slate-900 text-slate-50 p-3 rounded text-sm font-mono">
                        <pre className="whitespace-pre-wrap">{question.solution}</pre>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-center gap-4">
        <Button variant="outline" onClick={onRetake}>
          Retake Exam
        </Button>
        <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleDownloadReport}>
          <Download className="w-4 h-4 mr-2" />
          Download Report
        </Button>
      </div>
    </div>
  );
}
