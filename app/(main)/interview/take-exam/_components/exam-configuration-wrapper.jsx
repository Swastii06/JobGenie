"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ExamConfiguration from "./exam-configuration";
import ExamTaker from "./exam-taker";
import ExamResults from "./exam-results";

export default function ExamConfigurationWrapper() {
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
    </div>
  );
}
