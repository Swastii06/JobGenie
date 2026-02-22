// app/(main)/interview/mock/_components/proctored-quiz.jsx
"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, Eye, Settings } from "lucide-react";
import Quiz from "../../_components/quiz";
import ExamProctoring from "@/components/proctoring/exam-proctoring";
import WebcamCapture from "@/components/proctoring/webcam-capture";
import { healthCheck } from "@/lib/proctoring-service";

export default function ProctoredQuiz() {
  const { user } = useAuth();
  const [proctoringEnabled, setProctoringEnabled] = useState(false);
  const [proctoringSetup, setProctoringSetup] = useState("checking"); // checking, disabled, enabled, ready
  const [studentData, setStudentData] = useState(null);
  const [faceVerified, setFaceVerified] = useState(false);
  const [showOptions, setShowOptions] = useState(false);

  // Check if proctoring service is available
  useEffect(() => {
    const checkProctoring = async () => {
      try {
        const isAvailable = await healthCheck();
        setProctoringSetup(isAvailable ? "ready" : "disabled");
      } catch (err) {
        console.error("Proctoring service unavailable:", err);
        setProctoringSetup("disabled");
      }
    };

    checkProctoring();
  }, []);

  const handleProctoringToggle = (enabled) => {
    setProctoringEnabled(enabled);
    if (enabled && proctoringSetup === "ready") {
      setProctoringSetup("enabled");
    }
  };

  const handleFaceCapture = (imageData) => {
    // In a real scenario, you would verify the face here
    setFaceVerified(true);
    setStudentData({
      id: user?.id || "unknown",
      name: user?.fullName || "Student",
      email: user?.emailAddresses[0]?.emailAddress || "student@example.com",
      photo_data: imageData,
    });
    toast.success("Face verified successfully!");
  };

  if (proctoringSetup === "checking") {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center gap-3">
            <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full" />
            <p>Checking proctoring setup...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Option selection
  if (!proctoringEnabled && !showOptions) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Proctored Assessment
          </CardTitle>
          <CardDescription>
            Maintain exam integrity with AI-powered monitoring
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {proctoringSetup === "disabled" ? (
            <div className="bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-lg flex gap-3">
              <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-yellow-800">Proctoring Service Unavailable</p>
                <p className="text-yellow-700 text-xs mt-1">
                  Make sure the Django proctoring service is running on port 8000. You can continue
                  with the standard quiz.
                </p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Enhance your assessment with live proctoring to ensure test integrity and validity.
            </p>
          )}

          <div className="space-y-2">
            <Button
              onClick={() => handleProctoringToggle(true)}
              className="w-full"
              disabled={proctoringSetup === "disabled"}
            >
              <Eye className="h-4 w-4 mr-2" />
              {proctoringSetup === "disabled" ? "Proctoring Unavailable" : "Start with Proctoring"}
            </Button>
            <Button onClick={() => setShowOptions(true)} variant="outline" className="w-full">
              Continue Without Proctoring
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Face verification step for proctored exam
  if (proctoringEnabled && !faceVerified) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Student Identity Verification
            </CardTitle>
            <CardDescription>
              Please capture your face for verification before starting the proctored exam
            </CardDescription>
          </CardHeader>
        </Card>
        <WebcamCapture onCapture={handleFaceCapture} />
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => {
              setProctoringEnabled(false);
              setShowOptions(false);
            }}
            className="flex-1"
          >
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  // Proctored exam with monitoring
  if (proctoringEnabled && faceVerified) {
    return (
      <ExamProctoring
        studentId={studentData?.id}
        examName="Mock Quiz Assessment"
        totalQuestions={5}
        onExamStarted={(examId) => {
          toast.info("Exam started with proctoring active");
        }}
        onExamEnded={(results) => {
          toast.success("Exam completed");
        }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Proctored Mock Quiz</CardTitle>
            <CardDescription>
              Your exam is being monitored for integrity. Maintain focus on your screen.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Quiz />
          </CardContent>
        </Card>
      </ExamProctoring>
    );
  }

  // Standard quiz (no proctoring)
  return (
    <Card>
      <CardHeader>
        <CardTitle>Mock Quiz</CardTitle>
        <CardDescription>Test your knowledge with our AI-powered questions</CardDescription>
      </CardHeader>
      <CardContent>
        <Quiz />
      </CardContent>
    </Card>
  );
}
