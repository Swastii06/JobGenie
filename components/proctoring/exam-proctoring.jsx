// components/proctoring/exam-proctoring.jsx
"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Loader2 } from "lucide-react";
import {
  startExam,
  recordViolation,
  startProctoringMonitoring,
} from "@/lib/proctoring-service";
import ProctoringMonitor from "./proctoring-monitor";
import ProctoringWarning from "./proctoring-warning";

export default function ExamProctoring({
  studentId,
  examName,
  totalQuestions,
  onExamStarted,
  onExamEnded,
  children,
}) {
  const [examState, setExamState] = useState("initializing"); // initializing, monitoring, completed
  const [examId, setExamId] = useState(null);
  const [violations, setViolations] = useState([]);
  const [currentWarning, setCurrentWarning] = useState(null);
  const [sessionTime, setSessionTime] = useState(0);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Initialize exam
  useEffect(() => {
    const initializeExam = async () => {
      try {
        setIsLoading(true);
        const response = await startExam({
          student_id: studentId,
          exam_name: examName,
          total_questions: totalQuestions,
        });

        setExamId(response.exam_id);
        setExamState("monitoring");
        onExamStarted?.(response.exam_id);
      } catch (err) {
        setError(err.message);
        setExamState("error");
      } finally {
        setIsLoading(false);
      }
    };

    initializeExam();
  }, [studentId, examName, totalQuestions, onExamStarted]);

  // Setup proctoring monitoring
  useEffect(() => {
    if (examState !== "monitoring") return;

    const cleanup = startProctoringMonitoring((violationType, violationData) => {
      const violation = {
        violationType,
        severity: violationType === "tab_switch" ? "medium" : "high",
        description: violationData.description,
        detectedAt: new Date().toISOString(),
        ...violationData,
      };

      setViolations((prev) => [...prev, violation]);
      setCurrentWarning(violation);

      // Record violation to backend
      recordViolation({
        student_id: studentId,
        event_type: violationType,
        detected_objects: violationData.objects || [],
      }).catch((err) => console.error("Failed to record violation:", err));
    });

    return cleanup;
  }, [examState, studentId]);

  // Track session time
  useEffect(() => {
    if (examState !== "monitoring") return;

    const interval = setInterval(() => {
      setSessionTime((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [examState]);

  if (examState === "initializing" || isLoading) {
    return (
      <Card>
        <CardContent className="pt-6 flex justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin" />
            <p>Initializing exam proctoring...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (examState === "error") {
    return (
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            Proctoring Error
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Proctoring Monitor Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Exam Content */}
        <div className="lg:col-span-3">{children}</div>

        {/* Proctoring Panel */}
        <div className="lg:col-span-1">
          <ProctoringMonitor
            violations={violations}
            isMonitoring={examState === "monitoring"}
            sessionTime={sessionTime}
          />
        </div>
      </div>

      {/* Warning Modal */}
      {currentWarning && (
        <ProctoringWarning
          violation={currentWarning}
          onDismiss={() => setCurrentWarning(null)}
          onAction={() => setCurrentWarning(null)}
        />
      )}
    </div>
  );
}
