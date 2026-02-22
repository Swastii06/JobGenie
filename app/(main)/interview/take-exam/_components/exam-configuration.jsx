"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { AlertCircle, Zap } from "lucide-react";
import { toast } from "sonner";

const INDUSTRIES = [
  { value: "tech-software", label: "Technology - Software Development" },
  { value: "tech-web", label: "Technology - Web Development" },
  { value: "tech-data", label: "Technology - Data Science" },
  { value: "finance-banking", label: "Finance - Banking" },
  { value: "finance-accounting", label: "Finance - Accounting" },
  { value: "marketing", label: "Marketing" },
  { value: "sales", label: "Sales" },
  { value: "hr", label: "Human Resources" },
];

const DIFFICULTIES = [
  { value: "easy", label: "Easy", color: "green" },
  { value: "medium", label: "Medium", color: "yellow" },
  { value: "hard", label: "Hard", color: "red" },
];

export default function ExamConfiguration({ onStartExam, userIndustry }) {
  const [selectedIndustry, setSelectedIndustry] = useState(userIndustry || "");
  const [selectedDifficulty, setSelectedDifficulty] = useState("medium");
  
  const [questionCounts, setQuestionCounts] = useState({
    mcq: 5,
    coding: 2,
    subjective: 2,
    fillBlank: 1,
  });

  const [customQuestions, setCustomQuestions] = useState({
    mcq: false,
    coding: false,
    subjective: false,
    fillBlank: false,
  });

  const [duration, setDuration] = useState(60); // minutes
  const [customDuration, setCustomDuration] = useState(false);
  const [enableProctoring, setEnableProctoring] = useState(true);

  const handleQuestionCountChange = (type, value) => {
    const num = parseInt(value) || 0;
    setQuestionCounts(prev => ({
      ...prev,
      [type]: Math.max(0, Math.min(20, num))
    }));
  };

  const handleDurationChange = (value) => {
    const num = parseInt(value) || 30;
    setDuration(Math.max(15, Math.min(480, num))); // 15 min to 8 hours
  };

  const totalQuestions = Object.values(questionCounts).reduce((a, b) => a + b, 0);
  const estimatedTime = Math.ceil((totalQuestions * 3 + 5) / 60); // Rough estimate: 3 min per question

  const handleStartExam = () => {
    if (!selectedIndustry) {
      toast.error("Please select an industry");
      return;
    }

    if (totalQuestions === 0) {
      toast.error("Please select at least one question type");
      return;
    }

    const config = {
      industry: selectedIndustry,
      difficulty: selectedDifficulty,
      questionCounts,
      totalQuestions,
      duration,
      enableProctoring,
      customQuestions,
      startTime: new Date(),
    };

    onStartExam(config);
    toast.success("Exam started!");
  };

  return (
    <div className="grid grid-cols-3 gap-6">
      {/* Configuration Panel */}
      <div className="col-span-2 space-y-6">
        {/* Industry Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Select Industry</CardTitle>
            <CardDescription>Choose the industry for which to generate questions</CardDescription>
          </CardHeader>
          <CardContent>
            <Select value={selectedIndustry} onValueChange={setSelectedIndustry}>
              <SelectTrigger>
                <SelectValue placeholder="Select your industry..." />
              </SelectTrigger>
              <SelectContent>
                {INDUSTRIES.map(industry => (
                  <SelectItem key={industry.value} value={industry.value}>
                    {industry.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Difficulty Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Select Difficulty</CardTitle>
            <CardDescription>Choose the difficulty level for questions</CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
              <div className="grid grid-cols-3 gap-4">
                {DIFFICULTIES.map(diff => (
                  <div key={diff.value} className="flex items-center space-x-2">
                    <RadioGroupItem value={diff.value} id={`diff-${diff.value}`} />
                    <Label htmlFor={`diff-${diff.value}`} className="cursor-pointer">
                      <span className={`px-2 py-1 rounded text-sm font-medium bg-${diff.color}-100 text-${diff.color}-800`}>
                        {diff.label}
                      </span>
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </CardContent>
        </Card>

        {/* Question Type Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Question Types & Count</CardTitle>
            <CardDescription>Select the types and number of questions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* MCQ */}
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <Checkbox 
                  id="mcq"
                  checked={questionCounts.mcq > 0}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      handleQuestionCountChange("mcq", 5);
                    } else {
                      handleQuestionCountChange("mcq", 0);
                    }
                  }}
                />
                <Label htmlFor="mcq" className="cursor-pointer">
                  <div>
                    <p className="font-semibold">Multiple Choice Questions (MCQ)</p>
                    <p className="text-sm text-muted-foreground">Select one correct answer</p>
                  </div>
                </Label>
              </div>
              {questionCounts.mcq > 0 && (
                <Input
                  type="number"
                  min="1"
                  max="20"
                  value={questionCounts.mcq}
                  onChange={(e) => handleQuestionCountChange("mcq", e.target.value)}
                  className="w-16"
                />
              )}
            </div>

            {/* Coding */}
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <Checkbox 
                  id="coding"
                  checked={questionCounts.coding > 0}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      handleQuestionCountChange("coding", 2);
                    } else {
                      handleQuestionCountChange("coding", 0);
                    }
                  }}
                />
                <Label htmlFor="coding" className="cursor-pointer">
                  <div>
                    <p className="font-semibold">Coding Questions</p>
                    <p className="text-sm text-muted-foreground">Write code to solve problems</p>
                  </div>
                </Label>
              </div>
              {questionCounts.coding > 0 && (
                <Input
                  type="number"
                  min="1"
                  max="10"
                  value={questionCounts.coding}
                  onChange={(e) => handleQuestionCountChange("coding", e.target.value)}
                  className="w-16"
                />
              )}
            </div>

            {/* Subjective */}
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <Checkbox 
                  id="subjective"
                  checked={questionCounts.subjective > 0}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      handleQuestionCountChange("subjective", 2);
                    } else {
                      handleQuestionCountChange("subjective", 0);
                    }
                  }}
                />
                <Label htmlFor="subjective" className="cursor-pointer">
                  <div>
                    <p className="font-semibold">Subjective Questions</p>
                    <p className="text-sm text-muted-foreground">Essay type answers</p>
                  </div>
                </Label>
              </div>
              {questionCounts.subjective > 0 && (
                <Input
                  type="number"
                  min="1"
                  max="10"
                  value={questionCounts.subjective}
                  onChange={(e) => handleQuestionCountChange("subjective", e.target.value)}
                  className="w-16"
                />
              )}
            </div>

            {/* Fill in the Blanks */}
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <Checkbox 
                  id="fillBlank"
                  checked={questionCounts.fillBlank > 0}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      handleQuestionCountChange("fillBlank", 3);
                    } else {
                      handleQuestionCountChange("fillBlank", 0);
                    }
                  }}
                />
                <Label htmlFor="fillBlank" className="cursor-pointer">
                  <div>
                    <p className="font-semibold">Fill in the Blanks</p>
                    <p className="text-sm text-muted-foreground">Complete the sentences</p>
                  </div>
                </Label>
              </div>
              {questionCounts.fillBlank > 0 && (
                <Input
                  type="number"
                  min="1"
                  max="20"
                  value={questionCounts.fillBlank}
                  onChange={(e) => handleQuestionCountChange("fillBlank", e.target.value)}
                  className="w-16"
                />
              )}
            </div>
          </CardContent>
        </Card>

        {/* Exam Duration */}
        <Card>
          <CardHeader>
            <CardTitle>Exam Duration</CardTitle>
            <CardDescription>Set how long you have to complete the exam</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Input
                type="number"
                min="15"
                max="480"
                value={duration}
                onChange={(e) => handleDurationChange(e.target.value)}
                className="w-24"
              />
              <span className="text-muted-foreground">minutes</span>
              <p className="text-sm">
                Estimated time: <span className="font-semibold">{estimatedTime} minutes</span>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Proctoring Option */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Proctoring
            </CardTitle>
            <CardDescription>Enable AI-powered monitoring during the exam</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <Checkbox 
                id="proctoring"
                checked={enableProctoring}
                onCheckedChange={setEnableProctoring}
              />
              <Label htmlFor="proctoring" className="cursor-pointer">
                Enable Proctoring (Face detection, tab switch detection, etc.)
              </Label>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Summary Sidebar */}
      <Card className="h-fit sticky top-20">
        <CardHeader>
          <CardTitle>Exam Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">Industry</p>
            <p className="font-semibold">
              {INDUSTRIES.find(i => i.value === selectedIndustry)?.label || "Not selected"}
            </p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Difficulty</p>
            <p className="font-semibold capitalize">{selectedDifficulty}</p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Total Questions</p>
            <p className="font-semibold text-lg">{totalQuestions}</p>
          </div>

          <div className="space-y-2 py-2 border-t">
            {questionCounts.mcq > 0 && (
              <div className="flex justify-between text-sm">
                <span>MCQ</span>
                <span className="font-medium">{questionCounts.mcq}</span>
              </div>
            )}
            {questionCounts.coding > 0 && (
              <div className="flex justify-between text-sm">
                <span>Coding</span>
                <span className="font-medium">{questionCounts.coding}</span>
              </div>
            )}
            {questionCounts.subjective > 0 && (
              <div className="flex justify-between text-sm">
                <span>Subjective</span>
                <span className="font-medium">{questionCounts.subjective}</span>
              </div>
            )}
            {questionCounts.fillBlank > 0 && (
              <div className="flex justify-between text-sm">
                <span>Fill Blanks</span>
                <span className="font-medium">{questionCounts.fillBlank}</span>
              </div>
            )}
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Duration</p>
            <p className="font-semibold">{duration} minutes</p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Proctoring</p>
            <p className="font-semibold">{enableProctoring ? "Enabled" : "Disabled"}</p>
          </div>

          <Button 
            onClick={handleStartExam}
            className="w-full mt-4"
            size="lg"
            disabled={!selectedIndustry || totalQuestions === 0}
          >
            Start Exam
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
