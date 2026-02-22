"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, BookOpen, Code, FileText, FormInput } from "lucide-react";
import ExamConfiguration from "./_components/exam-configuration";
import ExamTaker from "./_components/exam-taker";
import ExamResults from "./_components/exam-results";

export default function TakeExamPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("configure");
  const [examConfig, setExamConfig] = useState(null);
  const [examAttempt, setExamAttempt] = useState(null);
  const [showResults, setShowResults] = useState(false);

  const handleStartExam = (config) => {
    setExamConfig(config);
    setExamAttempt({
      id: Date.now(),
      startTime: new Date(),
      config: config,
      answers: [],
    });
    setActiveTab("exam");
  };

  const handleSubmitExam = (results) => {
    setExamAttempt({
      ...examAttempt,
      ...results,
      endTime: new Date(),
    });
    setShowResults(true);
    setActiveTab("results");
  };

  const handleRetakExam = () => {
    setExamConfig(null);
    setExamAttempt(null);
    setShowResults(false);
    setActiveTab("configure");
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold gradient-title">Take Custom Exam</h1>
        <p className="text-muted-foreground">
          Create and take customized exams tailored to your skill level and interests
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="configure" disabled={showResults}>
            Configure
          </TabsTrigger>
          <TabsTrigger value="exam" disabled={!examConfig || showResults}>
            Exam
          </TabsTrigger>
          <TabsTrigger value="results" disabled={!showResults}>
            Results
          </TabsTrigger>
        </TabsList>

        {/* Configuration Tab */}
        <TabsContent value="configure" className="space-y-6">
          <ExamConfiguration 
            onStartExam={handleStartExam}
            userIndustry={user?.publicMetadata?.industry}
          />
        </TabsContent>

        {/* Exam Tab */}
        <TabsContent value="exam">
          {examAttempt ? (
            <ExamTaker 
              examAttempt={examAttempt}
              onSubmit={handleSubmitExam}
            />
          ) : (
            <Card>
              <CardContent className="pt-6">
                <p>No exam configured. Please configure an exam first.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Results Tab */}
        <TabsContent value="results">
          {showResults && examAttempt ? (
            <ExamResults 
              examAttempt={examAttempt}
              onRetake={handleRetakExam}
            />
          ) : (
            <Card>
              <CardContent className="pt-6">
                <p>No results available yet.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Quick Reference */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Question Types
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 font-semibold">
                <FormInput className="h-4 w-4" />
                MCQ
              </div>
              <p className="text-sm text-muted-foreground">
                Multiple choice questions
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 font-semibold">
                <Code className="h-4 w-4" />
                Coding
              </div>
              <p className="text-sm text-muted-foreground">
                Write and test code
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 font-semibold">
                <FileText className="h-4 w-4" />
                Subjective
              </div>
              <p className="text-sm text-muted-foreground">
                Essay type answers
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 font-semibold">
                <AlertCircle className="h-4 w-4" />
                Fill Blanks
              </div>
              <p className="text-sm text-muted-foreground">
                Complete the sentence
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
