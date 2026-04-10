"use client";

import React, { useState, useCallback, use } from "react";
import { getCodingChallenge, runTestCases, submitCodeSolution } from "@/actions/coding";
import ProblemStatement from "@/components/problem-statement";
import CodeEditor from "@/components/code-editor";
import SubmissionHistory from "@/components/submission-history";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useEffect } from "react";

export default function ChallengePage({ params: paramsPromise }) {
  const params = use(paramsPromise);
  const [challenge, setChallenge] = useState(null);
  const [userStats, setUserStats] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [testResults, setTestResults] = useState(null);
  const [isLoadingChallenge, setIsLoadingChallenge] = useState(true);
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load challenge data
  useEffect(() => {
    async function loadChallenge() {
      try {
        const data = await getCodingChallenge(params.id);
        console.log("Challenge loaded:", data.challenge);
        console.log("Code templates:", data.challenge?.codeTemplates);
        setChallenge(data.challenge);
        setUserStats(data.stats);
        setSubmissions(data.userSubmissions);
      } catch (error) {
        toast.error("Failed to load challenge");
        console.error(error);
      } finally {
        setIsLoadingChallenge(false);
      }
    }

    loadChallenge();
  }, [params.id]);

  // Run test cases
  const handleRunTests = useCallback(
    async (code, language) => {
      if (!challenge) return;

      setIsRunningTests(true);
      try {
        const results = await runTestCases(challenge.id, code, language);
        setTestResults(results);

        if (results.success) {
          const passedCount = results.tests.filter((t) => t.passed).length;
          const totalCount = results.tests.length;

          if (passedCount === totalCount) {
            toast.success("🎉 All tests passed! Great job!");
          } else {
            toast.info(
              `${passedCount}/${totalCount} tests passed. Keep trying!`
            );
          }
        } else {
          toast.error(results.error || "Failed to run tests");
        }
      } catch (error) {
        toast.error("Error running tests");
        console.error(error);
      } finally {
        setIsRunningTests(false);
      }
    },
    [challenge]
  );

  // Submit solution
  const handleSubmit = useCallback(
    async (code, language) => {
      if (!challenge) return;

      setIsSubmitting(true);
      try {
        // First run tests
        const results = await runTestCases(challenge.id, code, language);
        setTestResults(results);

        // Then submit
        if (results.success) {
          const submission = await submitCodeSolution(
            challenge.id,
            code,
            language,
            results
          );

          toast.success(submission.message);

          // Reload submissions
          const data = await getCodingChallenge(params.id);
          setSubmissions(data.userSubmissions);
          setUserStats(data.stats);
        } else {
          toast.error("Please fix your code before submitting");
        }
      } catch (error) {
        toast.error("Failed to submit solution");
        console.error(error);
      } finally {
        setIsSubmitting(false);
      }
    },
    [challenge, params.id]
  );

  if (isLoadingChallenge) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin">
          <div className="w-12 h-12 border-4 border-blue-300 border-t-blue-600 rounded-full"></div>
        </div>
      </div>
    );
  }

  if (!challenge) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-lg text-gray-600">Challenge not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Problem Statement - Left Side */}
        <div className="lg:col-span-1">
          <ProblemStatement challenge={challenge} userStats={userStats} />
        </div>

        {/* Code Editor and Results - Right Side */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="editor" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="editor">Editor</TabsTrigger>
              <TabsTrigger value="submissions">
                Submissions ({submissions.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="editor" className="space-y-6">
              <CodeEditor
                challenge={challenge}
                initialCode={
                  challenge.codeTemplates?.["python"] || ""
                }
                onRunTests={handleRunTests}
                onSubmit={handleSubmit}
                isRunning={isRunningTests || isSubmitting}
                testResults={testResults}
              />
            </TabsContent>

            <TabsContent value="submissions">
              <SubmissionHistory submissions={submissions} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
