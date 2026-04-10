"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import MDEditor from "@uiw/react-md-editor";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Info, CheckCircle2, AlertCircle, Lightbulb } from "lucide-react";

export default function ProblemStatement({ challenge, userStats }) {
  const difficultyColors = {
    easy: "bg-green-100 text-green-800",
    medium: "bg-yellow-100 text-yellow-800",
    hard: "bg-red-100 text-red-800",
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <CardTitle className="text-2xl">{challenge.title}</CardTitle>
                <div className="flex gap-2">
                  <Badge className={difficultyColors[challenge.difficulty]}>
                    {challenge.difficulty.charAt(0).toUpperCase() +
                      challenge.difficulty.slice(1)}
                  </Badge>
                  <Badge variant="outline">{challenge.category}</Badge>
                </div>
              </div>
              {userStats && (
                <div className="text-right space-y-1">
                  <div className="text-2xl font-bold text-green-600">
                    {userStats.accepted > 0 && (
                      <>
                        <CheckCircle2 className="inline w-6 h-6 mr-2" />
                        Solved
                      </>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">
                    {userStats.totalSubmissions} submissions
                  </p>
                </div>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="border-l-4 border-blue-500 pl-4">
                <p className="text-gray-600">Acceptance Rate</p>
                <p className="font-bold text-lg">
                  {challenge.acceptance.toFixed(1)}%
                </p>
              </div>
              <div className="border-l-4 border-purple-500 pl-4">
                <p className="text-gray-600">Total Submissions</p>
                <p className="font-bold text-lg">{challenge.submissionCount}</p>
              </div>
              <div className="border-l-4 border-orange-500 pl-4">
                <p className="text-gray-600">Supported Languages</p>
                <p className="font-bold text-lg">{challenge.languages.length}</p>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Tabs for Description, Examples, Constraints */}
      <Tabs defaultValue="description" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="description">Description</TabsTrigger>
          <TabsTrigger value="examples">Examples</TabsTrigger>
          <TabsTrigger value="constraints">Constraints</TabsTrigger>
          <TabsTrigger value="hints">Hints</TabsTrigger>
        </TabsList>

        {/* Description Tab */}
        <TabsContent value="description">
          <Card>
            <CardContent className="pt-6">
              <div data-color-mode="light">
                <MDEditor.Markdown
                  source={challenge.description}
                  style={{
                    backgroundColor: "#ffffff",
                    color: "#000000",
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Examples Tab */}
        <TabsContent value="examples">
          <div className="space-y-4">
            {challenge.examples?.map((example, idx) => (
              <Card key={idx}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Example {idx + 1}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm font-semibold mb-1">Input:</p>
                    <pre className="bg-slate-100 p-3 rounded-lg text-xs overflow-x-auto">
                      {example.input}
                    </pre>
                  </div>
                  <div>
                    <p className="text-sm font-semibold mb-1">Output:</p>
                    <pre className="bg-slate-100 p-3 rounded-lg text-xs overflow-x-auto">
                      {example.output}
                    </pre>
                  </div>
                  {example.explanation && (
                    <div>
                      <p className="text-sm font-semibold mb-1">Explanation:</p>
                      <p className="text-sm text-gray-700">
                        {example.explanation}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Constraints Tab */}
        <TabsContent value="constraints">
          <Card>
            <CardContent className="pt-6">
              {challenge.constraints ? (
                <div data-color-mode="light">
                  <MDEditor.Markdown
                    source={challenge.constraints}
                    style={{
                      backgroundColor: "#ffffff",
                      color: "#000000",
                    }}
                  />
                </div>
              ) : (
                <p className="text-gray-500">No constraints specified</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Hints Tab */}
        <TabsContent value="hints">
          <div className="space-y-3">
            {challenge.hints && challenge.hints.length > 0 ? (
              challenge.hints.map((hint, idx) => (
                <Card key={idx} className="bg-blue-50 border-blue-200">
                  <CardContent className="pt-6 flex gap-3">
                    <Lightbulb className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
                    <p className="text-sm text-gray-700">{hint}</p>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card className="bg-gray-50">
                <CardContent className="pt-6">
                  <p className="text-sm text-gray-500">No hints available</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Supported Languages */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Supported Languages</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {challenge.languages.map((lang) => (
              <Badge key={lang} variant="secondary">
                {lang.charAt(0).toUpperCase() + lang.slice(1)}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
