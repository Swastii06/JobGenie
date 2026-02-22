"use client";

import { useState } from "react";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import QuizResult from "./quiz-result";

export default function QuizList({ assessments }) {
  const router = useRouter();
  const [selectedQuiz, setSelectedQuiz] = useState(null);

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h3 className="font-semibold text-lg">Recent Quizzes</h3>
            <p className="text-sm text-muted-foreground">
              Review your past performance
            </p>
          </div>
          <Button 
            onClick={() => router.push("/interview/mock")}
            size="sm"
            className="whitespace-nowrap"
          >
            New Quiz
          </Button>
        </div>
        
        {assessments && assessments.length > 0 ? (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {assessments?.slice(0, 5).map((assessment, i) => (
              <Card
                key={assessment.id}
                className="cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => setSelectedQuiz(assessment)}
              >
                <CardContent className="pt-3 pb-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm">Quiz {i + 1}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(
                          new Date(assessment.createdAt),
                          "MMM dd, yyyy"
                        )}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg text-green-600">
                        {assessment.quizScore.toFixed(0)}%
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="pt-4 pb-4">
              <p className="text-sm text-muted-foreground text-center">
                No quizzes yet. Start a new quiz to get started!
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      <Dialog open={!!selectedQuiz} onOpenChange={() => setSelectedQuiz(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle></DialogTitle>
          </DialogHeader>
          <QuizResult
            result={selectedQuiz}
            hideStartNew
            onStartNew={() => router.push("/interview/mock")}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}