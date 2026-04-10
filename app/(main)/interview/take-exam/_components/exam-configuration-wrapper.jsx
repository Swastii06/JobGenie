"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import ExamConfiguration from "./exam-configuration";
import ExamInstructions from "./exam-instructions";
import ExamTaker from "./exam-taker";
import ExamResults from "./exam-results";
import { generateCustomExamQuestions, reviewSubjectiveAnswers, createCustomProctoredExam, saveExamAttemptResult } from "@/actions/interview";

export default function ExamConfigurationWrapper() {
  const [activeTab, setActiveTab] = useState("configure");
  const [examConfig, setExamConfig] = useState(null);
  const [examAttempt, setExamAttempt] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isReviewing, setIsReviewing] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [tempConfig, setTempConfig] = useState(null);

  // Cleanup streams on component unmount or navigation
  useEffect(() => {
    return () => {
      console.log("[ExamConfigurationWrapper] Cleaning up streams on unmount");
      try {
        document.querySelectorAll('video').forEach(v => {
          if (v?.srcObject) {
            v.srcObject.getTracks().forEach(t => t.stop());
            v.srcObject = null;
          }
          v.pause?.();
        });
        
        document.querySelectorAll('audio').forEach(a => {
          if (a?.srcObject) {
            a.srcObject.getTracks().forEach(t => t.stop());
            a.srcObject = null;
          }
          a.pause?.();
        });
      } catch (e) {
        console.error("[ExamConfigurationWrapper] Cleanup error:", e);
      }
    };
  }, []);

  const handleStartExam = (config) => {
    console.log("\n========== CLIENT: HANDLE START EXAM CALLED ==========");
    console.log("Config received:", JSON.stringify(config, null, 2));
    
    // Save config temporarily and show instructions
    setTempConfig(config);
    setShowInstructions(true);
  };

  const handleProceedFromInstructions = async () => {
    if (!tempConfig) return;
    
    console.log("Proceeding from instructions to generate exam...");
    setIsGenerating(true);
    
    try {
      console.log("Preparing to call generateCustomExamQuestions...");
      
      const questionTypeParams = {
        mcq: tempConfig.questionCounts.mcq > 0,
        coding: tempConfig.questionCounts.coding > 0,
        sql: tempConfig.questionCounts.sql > 0,
        subjective: tempConfig.questionCounts.subjective > 0,
        fillBlank: tempConfig.questionCounts.fillBlank > 0,
      };
      
      console.log("Question type parameters:", questionTypeParams);
      console.log("Question counts:", tempConfig.questionCounts);
      
      // Call the server action
      console.log("About to call generateCustomExamQuestions server action...");
      const questions = await generateCustomExamQuestions(
        tempConfig.industry,
        tempConfig.difficulty,
        questionTypeParams,
        tempConfig.questionCounts,
        tempConfig.preferredLanguage,
        tempConfig.preferredSqlDialect
      );

      console.log("Server returned questions:", questions);
      console.log("Questions array length:", questions?.length);

      if (!questions || questions.length === 0) {
        console.error("Questions array is empty");
        toast.error("Failed to generate exam questions.");
        setIsGenerating(false);
        return;
      }

      // Debug: Log question structure
      console.log("DEBUG: Generated questions:");
      questions.forEach((q, idx) => {
        if (q.type === "CODING") {
          console.log(`  Q${idx} (CODING):`, {
            id: q.id,
            templates: typeof q.templates,
            template: typeof q.template,
            language: q.language,
            sqlDialect: q.sqlDialect,
            hasTemplates: !!q.templates,
            templateKeys: q.templates ? Object.keys(q.templates) : 'N/A'
          });
        }
      });

      // Process questions
      const questionsWithIds = questions.map((q, idx) => ({
        ...q,
        id: q.id || idx + 1,
      }));

      const examConfigData = {
        ...tempConfig,
        questions: questionsWithIds,
        preferredLanguage: tempConfig.preferredLanguage,
      };

      // Persist exam definition for history tracking
      const dbExam = await createCustomProctoredExam(examConfigData);

      const examAttemptData = {
        id: Date.now(),
        dbExamId: dbExam.id,
        startTime: new Date(),
        config: {
          ...tempConfig,
          preferredLanguage: tempConfig.preferredLanguage,
          questions: questionsWithIds,
        },
        answers: [],
      };

      setExamConfig(examConfigData);
      setExamAttempt(examAttemptData);
      setTempConfig(null);
      setActiveTab("exam");
      setShowInstructions(false);
      
      // Check if we're using fallback questions
      const useFallback = questions.some(q => q.isFallback);
      if (useFallback) {
        toast.warning("⚠️ AI service temporarily unavailable. Using pre-made questions instead.");
      } else {
        toast.success(`Generated ${questionsWithIds.length} questions!`);
      }
    } catch (error) {
      console.error("ERROR in handleProceedFromInstructions:", error);
      console.error("Error message:", error?.message);
      console.error("Error stack:", error?.stack);
      toast.error(`Error: ${error?.message || "Unknown error"}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmitExam = async (results) => {
    console.log("handleSubmitExam: Exam submitted, cleaning up streams...");
    
    // CRITICAL: Stop all media streams immediately
    try {
      // Stop all video elements
      document.querySelectorAll('video').forEach(v => {
        try {
          if (v?.srcObject) {
            v.srcObject.getTracks().forEach(t => t.stop());
            v.srcObject = null;
          }
          v.pause?.();
        } catch (e) {
          console.error("Error stopping video:", e);
        }
      });
      
      // Stop all audio elements
      document.querySelectorAll('audio').forEach(a => {
        try {
          if (a?.srcObject) {
            a.srcObject.getTracks().forEach(t => t.stop());
            a.srcObject = null;
          }
          a.pause?.();
        } catch (e) {
          console.error("Error stopping audio:", e);
        }
      });
    } catch (e) {
      console.error("Error in stream cleanup:", e);
    }
    
    setIsReviewing(true);
    
    try {
      // Extract questions from results
      const questionsToReview = results.questions || [];
      
      console.log("Sending", questionsToReview.length, "questions for AI review...");
      
      // Call the AI review function for subjective and coding answers
      const reviewedQuestions = await reviewSubjectiveAnswers(questionsToReview);
      
      console.log("AI review completed, received", reviewedQuestions.length, "reviewed questions");
      
      // Update results with reviewed questions
      const updatedResults = {
        ...results,
        questions: reviewedQuestions,
      };
      
      // Recalculate score based on reviewed answers
      let totalCorrect = 0;
      reviewedQuestions.forEach(q => {
        if (q.isCorrect || q.questionType === "SUBJECTIVE" && q.reviewedByAI) {
          totalCorrect++;
        }
      });
      
      updatedResults.correctAnswers = totalCorrect;
      updatedResults.percentageScore = Math.round((totalCorrect / reviewedQuestions.length) * 100);
      
      console.log("Updated score:", updatedResults.correctAnswers, "out of", reviewedQuestions.length);
      
      setExamAttempt({
        ...examAttempt,
        ...updatedResults,
        endTime: new Date(),
      });

      // Persist exam attempt history
      try {
        await saveExamAttemptResult({
          examId: examAttempt?.dbExamId,
          startTime: examAttempt?.startTime,
          endTime: new Date(),
          config: examConfig,
          results: updatedResults,
        });
      } catch (persistErr) {
        console.error("Failed to save exam attempt history:", persistErr);
      }
      
      setShowResults(true);
      setActiveTab("results");
      toast.success("Exam submitted! AI has reviewed your answers.");
    } catch (error) {
      console.error("Error reviewing exam:", error);
      toast.error("Error reviewing exam answers. Showing results anyway...");
      
      // Still show results even if review fails
      setExamAttempt({
        ...examAttempt,
        ...results,
        endTime: new Date(),
      });
      
      setShowResults(true);
      setActiveTab("results");
    } finally {
      setIsReviewing(false);
    }
  };

  const handleRetakExam = () => {
    setExamConfig(null);
    setExamAttempt(null);
    setShowResults(false);
    setShowInstructions(false);
    setTempConfig(null);
    setActiveTab("configure");
  };

  // Show instructions screen when instructions should be displayed
  if (showInstructions) {
    return (
      <ExamInstructions 
        onProceedToExam={handleProceedFromInstructions}
        examConfig={tempConfig}
        isGenerating={isGenerating}
      />
    );
  }

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
            isGenerating={isGenerating}
          />
        </TabsContent>

        {/* Exam Tab */}
        <TabsContent value="exam">
          {examAttempt ? (
            <ExamTaker 
              examAttempt={examAttempt}
              onSubmit={handleSubmitExam}
              onQuit={handleRetakExam}
              isReviewing={isReviewing}
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
