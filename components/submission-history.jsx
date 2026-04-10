"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { format } from "date-fns";

export default function SubmissionHistory({ submissions = [] }) {
  const [expandedId, setExpandedId] = useState(null);

  const getVerdictIcon = (verdict) => {
    switch (verdict) {
      case "accepted":
        return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case "partially_correct":
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case "wrong_answer":
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      case "runtime_error":
      case "compilation_error":
        return <AlertCircle className="w-5 h-5 text-red-700" />;
      case "time_limit_exceeded":
        return <Clock className="w-5 h-5 text-orange-600" />;
      default:
        return <Clock className="w-5 h-5 text-gray-600" />;
    }
  };

  const getVerdictColor = (verdict) => {
    switch (verdict) {
      case "accepted":
        return "bg-green-100 text-green-800";
      case "partially_correct":
        return "bg-yellow-100 text-yellow-800";
      case "wrong_answer":
        return "bg-red-100 text-red-800";
      case "runtime_error":
      case "compilation_error":
        return "bg-red-200 text-red-900";
      case "time_limit_exceeded":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (!submissions || submissions.length === 0) {
    return (
      <Card className="bg-slate-50">
        <CardContent className="pt-6 text-center text-gray-500">
          <p>No submissions yet. Submit your first solution!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold">Submission History</h3>
      {submissions.map((submission) => (
        <Card
          key={submission.id}
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() =>
            setExpandedId(expandedId === submission.id ? null : submission.id)
          }
        >
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {getVerdictIcon(submission.verdict)}
                <div>
                  <p className="font-semibold">
                    {submission.language.charAt(0).toUpperCase() +
                      submission.language.slice(1)}
                  </p>
                  <p className="text-xs text-gray-500">
                    {format(new Date(submission.submissionTime), "PPpp")}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge className={getVerdictColor(submission.verdict)}>
                  {submission.verdict
                    .replace(/_/g, " ")
                    .split(" ")
                    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(" ")}
                </Badge>
                {expandedId === submission.id ? (
                  <ChevronUp className="w-5 h-5 text-gray-500" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-500" />
                )}
              </div>
            </div>
          </CardHeader>

          {expandedId === submission.id && (
            <CardContent className="space-y-4 border-t pt-4">
              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Tests Passed</p>
                  <p className="font-bold">
                    {submission.passedTests}/{submission.totalTests}
                  </p>
                </div>
                {submission.executionTime && (
                  <div>
                    <p className="text-gray-600">Execution Time</p>
                    <p className="font-bold">{submission.executionTime}ms</p>
                  </div>
                )}
                {submission.memoryUsed && (
                  <div>
                    <p className="text-gray-600">Memory</p>
                    <p className="font-bold">{submission.memoryUsed}MB</p>
                  </div>
                )}
              </div>

              {/* Code */}
              <div>
                <p className="text-sm font-semibold mb-2">Code:</p>
                <pre className="bg-slate-100 p-3 rounded-lg text-xs overflow-x-auto max-h-48">
                  {submission.code}
                </pre>
              </div>

              {/* Test Results */}
              {submission.testResults && submission.testResults.length > 0 && (
                <div>
                  <p className="text-sm font-semibold mb-2">Test Results:</p>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {submission.testResults.map((test, idx) => (
                      <div
                        key={idx}
                        className={`p-2 rounded text-xs ${
                          test.passed ? "bg-green-50" : "bg-red-50"
                        }`}
                      >
                        <span
                          className={
                            test.passed
                              ? "text-green-700 font-bold"
                              : "text-red-700 font-bold"
                          }
                        >
                          Test {idx + 1}:{" "}
                          {test.passed ? "Passed" : "Failed"}
                        </span>
                        {!test.passed && test.error && (
                          <p className="text-red-600 mt-1">{test.error}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Error Message */}
              {submission.message && (
                <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg text-sm text-yellow-800">
                  <p className="font-semibold mb-1">Message:</p>
                  <p>{submission.message}</p>
                </div>
              )}

              {/* Copy Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  navigator.clipboard.writeText(submission.code);
                }}
              >
                Copy Code
              </Button>
            </CardContent>
          )}
        </Card>
      ))}
    </div>
  );
}
