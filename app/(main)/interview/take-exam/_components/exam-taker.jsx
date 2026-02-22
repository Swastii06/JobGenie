"use client";

import { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle, Clock, CheckCircle2, Eye, AlertTriangle, Play, Eye as EyeOff, Lock, Camera, CameraOff } from "lucide-react";
import { toast } from "sonner";

// Lazy load Monaco Editor
const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => <div className="h-60 bg-slate-900 animate-pulse rounded-lg" />,
});

// Lazy load WebcamCapture
const WebcamCapture = dynamic(() => import("@/components/proctoring/webcam-capture"), {
  ssr: false,
  loading: () => <div className="w-32 h-32 bg-gray-900 rounded-lg animate-pulse" />,
});

// Mock questions data - WITHOUT pre-filled solutions
const MOCK_QUESTIONS = {
  "tech-software": {
    mcq: [
      {
        id: 1,
        type: "MCQ",
        question: "What is the time complexity of binary search?",
        options: ["O(n)", "O(log n)", "O(n²)", "O(2^n)"],
        correctAnswer: "O(log n)",
        explanation: "Binary search divides the search space in half with each iteration, resulting in logarithmic time complexity.",
      },
      {
        id: 2,
        type: "MCQ",
        question: "Which data structure uses LIFO?",
        options: ["Queue", "Stack", "Tree", "Graph"],
        correctAnswer: "Stack",
        explanation: "Stack (Last In, First Out) means the last element added is the first one to be removed.",
      },
    ],
    coding: [
      {
        id: 3,
        type: "CODING",
        question: "Write a function to check if a number is prime.\n\nExample:\nis_prime(5) → True\nis_prime(4) → False",
        template: "def is_prime(n):\n    # Write your code here\n    pass",
        language: "python",
        sampleInput: "5",
        sampleOutput: "True",
        explanation: "A prime number is only divisible by 1 and itself. Check divisors up to the square root of n.",
        solution: "def is_prime(n):\n    if n < 2:\n        return False\n    for i in range(2, int(n**0.5) + 1):\n        if n % i == 0:\n            return False\n    return True",
      },
    ],
    subjective: [
      {
        id: 4,
        type: "SUBJECTIVE",
        question: "Explain the concept of polymorphism in OOP.",
        explanation: "Polymorphism allows objects to take on multiple forms through compile-time (overloading) and runtime (overriding) mechanisms.",
        solution: "Polymorphism means 'many forms'. It permits you to write flexible and reusable code. Two types: (1) Compile-time polymorphism through method/operator overloading, (2) Runtime polymorphism through method overriding via inheritance and interfaces.",
      },
    ],
    fillBlank: [
      {
        id: 5,
        type: "FILL_BLANK",
        question: "The process of converting source code into machine code is called ______.",
        correctAnswer: "compilation",
        explanation: "Compilation is the process where source code is translated into machine-readable form.",
        solution: "compilation",
      },
    ],
  },
};

export default function ExamTaker({ examAttempt, onSubmit }) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeRemaining, setTimeRemaining] = useState(examAttempt.config.duration * 60);
  const [submitted, setSubmitted] = useState(false);
  const [violations, setViolations] = useState([]);
  const [isPageVisible, setIsPageVisible] = useState(true);
  const [codeLanguage, setCodeLanguage] = useState("python");
  const [codeOutput, setCodeOutput] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copyAttempts, setCopyAttempts] = useState(0);
  const [pasteAttempts, setPasteAttempts] = useState(0);
  const [cameraActive, setCameraActive] = useState(false);
  const [faceVerified, setFaceVerified] = useState(false);
  const detectionRef = useRef(null);

  // Generate mock questions based on config
  const questions = [];
  const config = examAttempt.config;

  if (config.questionCounts.mcq > 0) {
    questions.push(...MOCK_QUESTIONS[config.industry]?.mcq || []);
  }
  if (config.questionCounts.coding > 0) {
    questions.push(...MOCK_QUESTIONS[config.industry]?.coding || []);
  }
  if (config.questionCounts.subjective > 0) {
    questions.push(...MOCK_QUESTIONS[config.industry]?.subjective || []);
  }
  if (config.questionCounts.fillBlank > 0) {
    questions.push(...MOCK_QUESTIONS[config.industry]?.fillBlank || []);
  }

  // Function to analyze camera feed for violations using backend proctoring service
  const analyzeFrameForViolations = async (frameData) => {
    try {
      const response = await fetch("/api/proctoring/analyze-frame", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          frameData: frameData, // base64 encoded image
          examId: examAttempt.id,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        
        // Check for detected violations
        if (result.violations && result.violations.length > 0) {
          result.violations.forEach(violation => {
            const violationObj = {
              type: violation.type,
              timestamp: new Date(),
              details: violation.message || violation.type,
              confidence: violation.confidence || 100,
              // attach the snapshot so results can show the image
              snapshot: frameData ? `data:image/jpeg;base64,${frameData}` : null,
            };
            setViolations(prev => [...prev, violationObj]);

            if (violation.severity === "high") {
              toast.error(`❌ ${violation.message}`);
            } else {
              toast.warning(`⚠️ ${violation.message}`);
            }
          });
        }

        // Check face detection
        if (result.faceDetected !== undefined) {
          if (!result.faceDetected && !faceVerified) {
            toast.info("📷 Position your face in the camera frame");
          }
          setFaceVerified(result.faceDetected);
        }
      }
    } catch (err) {
      console.log("Could not analyze frame:", err.message);
    }
  };

  // Periodically capture and analyze camera frames (every 5 seconds)
  useEffect(() => {
    if (!config.enableProctoring || submitted || !cameraActive) return;

    const interval = setInterval(async () => {
      // Try to get frame from video element if available
      const videoElements = document.querySelectorAll('video');
        if (videoElements.length > 0) {
        const video = videoElements[0];
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0);
        const frameData = canvas.toDataURL('image/jpeg').split(',')[1]; // base64

        // Send for analysis and keep snapshot association
        analyzeFrameForViolations(frameData);
      }
    }, 5000); // Analyze every 5 seconds

    return () => clearInterval(interval);
  }, [config.enableProctoring, submitted, cameraActive]);

  // Fullscreen requirement on mount
  useEffect(() => {
    if (config.enableProctoring && !submitted) {
      const element = document.documentElement;
      if (element.requestFullscreen) {
        element.requestFullscreen().catch(err => {
          toast.warning("⚠️ Fullscreen is required for proctored exams. Please enable it.");
        });
      }
    }
  }, []);

  // Initialize camera when proctoring is enabled
  useEffect(() => {
    if (config.enableProctoring && !submitted) {
      setCameraActive(true);
      toast.info("📷 Starting proctoring camera...");
    }

    // Cleanup: Stop camera on exam submission or unmount
    return () => {
      if (submitted || config.enableProctoring === false) {
        setCameraActive(false);
        // Stop all media streams
        if (detectionRef.current && detectionRef.current.stream) {
          detectionRef.current.stream.getTracks().forEach(track => track.stop());
          detectionRef.current.stream = null;
        }
      }
    };
  }, [config.enableProctoring, submitted]);

  // Proctoring: Detect tab switches, window blur, etc.
  useEffect(() => {
    const handleVisibilityChange = () => {
      const isVisible = document.visibilityState === "visible";
      setIsPageVisible(isVisible);

      if (!isVisible && config.enableProctoring && !submitted) {
        const violation = {
          type: "TAB_SWITCH",
          timestamp: new Date(),
          details: `Switched tabs at ${new Date().toLocaleTimeString()}`
        };
        setViolations(prev => [...prev, violation]);
        toast.warning(`⚠️ Tab switch detected!`);
      }
    };

    const handleWindowBlur = () => {
      // Only register blur if the tab is actually hidden (document.hidden checks tab visibility)
      if (config.enableProctoring && !submitted && !document.hidden) {
        // Don't register blur - this is likely from internal elements like camera window
        return;
      }
    };

    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = !!(document.fullscreenElement || document.webkitFullscreenElement);
      setIsFullscreen(isCurrentlyFullscreen);
      
      if (!isCurrentlyFullscreen && config.enableProctoring && !submitted) {
        const violation = {
          type: "FULLSCREEN_EXIT",
          timestamp: new Date(),
          details: `Exited fullscreen at ${new Date().toLocaleTimeString()}`
        };
        setViolations(prev => [...prev, violation]);
        toast.error(`❌ You must remain in fullscreen mode!`);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleWindowBlur);
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleWindowBlur);
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("webkitfullscreenchange", handleFullscreenChange);
    };
  }, [config.enableProctoring, submitted]);

  // Proctoring: Block right-click and track copy/paste
  useEffect(() => {
    const handleContextMenu = (e) => {
      if (config.enableProctoring && !submitted) {
        e.preventDefault();
        const violation = {
          type: "RIGHT_CLICK",
          timestamp: new Date(),
          details: `Right-click attempt at ${new Date().toLocaleTimeString()}`
        };
        setViolations(prev => [...prev, violation]);
        toast.error("❌ Right-click is disabled during the exam");
      }
    };

    const handleCopy = (e) => {
      if (config.enableProctoring && !submitted) {
        e.preventDefault();
        setCopyAttempts(prev => prev + 1);
        const violation = {
          type: "COPY_ATTEMPT",
          timestamp: new Date(),
          details: `Copy attempt at ${new Date().toLocaleTimeString()}`
        };
        setViolations(prev => [...prev, violation]);
        toast.error("❌ Copy is disabled during the exam");
      }
    };

    const handlePaste = (e) => {
      if (config.enableProctoring && !submitted) {
        e.preventDefault();
        setPasteAttempts(prev => prev + 1);
        const violation = {
          type: "PASTE_ATTEMPT",
          timestamp: new Date(),
          details: `Paste attempt at ${new Date().toLocaleTimeString()}`
        };
        setViolations(prev => [...prev, violation]);
        toast.error("❌ Paste is disabled during the exam");
      }
    };

    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("copy", handleCopy);
    document.addEventListener("paste", handlePaste);

    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("copy", handleCopy);
      document.removeEventListener("paste", handlePaste);
    };
  }, [config.enableProctoring, submitted]);

  // Proctoring: Block suspicious shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (config.enableProctoring && !submitted) {
        // Block copy, cut, paste, save, print
        const blockedKeys = {
          'c': { ctrl: true, name: 'Copy' },
          'x': { ctrl: true, name: 'Cut' },
          'v': { ctrl: true, name: 'Paste' },
          's': { ctrl: true, name: 'Save' },
          'p': { ctrl: true, name: 'Print' },
          'a': { ctrl: true, name: 'Select All' },
        };

        const key = e.key.toLowerCase();
        if (blockedKeys[key] && (e.ctrlKey || e.metaKey)) {
          e.preventDefault();
          const action = blockedKeys[key].name;
          
          const violation = {
            type: `${action.toUpperCase()}_BLOCKED`,
            timestamp: new Date(),
            details: `${action} shortcut blocked at ${new Date().toLocaleTimeString()}`
          };
          setViolations(prev => [...prev, violation]);
          toast.warning(`❌ ${action} is disabled during the exam`);
        }

        // Block F12 (Dev tools)
        if (e.key === 'F12') {
          e.preventDefault();
          const violation = {
            type: 'DEV_TOOLS_ATTEMPT',
            timestamp: new Date(),
            details: `Developer tools access attempt at ${new Date().toLocaleTimeString()}`
          };
          setViolations(prev => [...prev, violation]);
          toast.error("❌ Developer tools are not allowed");
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [config.enableProctoring, submitted]);

  // Timer effect
  useEffect(() => {
    if (submitted) return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 0) {
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [submitted]);

  // Cleanup camera when exam is submitted
  useEffect(() => {
    if (submitted) {
      setCameraActive(false);

      // Exit fullscreen mode
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(err => console.log("Could not exit fullscreen"));
      } else if (document.webkitFullscreenElement) {
        document.webkitExitFullscreen?.();
      }

      // Stop all active media streams
      if (detectionRef.current?.stream) {
        detectionRef.current.stream.getTracks().forEach(track => track.stop());
        detectionRef.current.stream = null;
      }

      // Remove any remaining video elements to be safe
      document.querySelectorAll('video').forEach(v => {
        try {
          if (v && v.srcObject) {
            v.srcObject.getTracks().forEach(t => t.stop());
            v.srcObject = null;
          }
          v.pause?.();
          if (v.parentNode) v.parentNode.removeChild(v);
        } catch (e) {
          // ignore
        }
      });
    }
  }, [submitted]);

  // Expose stream holder to child webcam component
  const handleStream = (s) => {
    if (!detectionRef.current) detectionRef.current = {};
    detectionRef.current.stream = s;
  };

  const toggleFullscreen = async () => {
    try {
      if (!isFullscreen) {
        await document.documentElement.requestFullscreen();
      } else {
        if (document.fullscreenElement) await document.exitFullscreen();
      }
    } catch (e) {
      console.log('Fullscreen toggle failed', e.message);
    }
  };

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;
  const isTimeWarning = timeRemaining < 300; // 5 minutes

  const handleAnswerChange = (value) => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: value,
    }));
  };

  const handleRunCode = async () => {
    const code = answers[currentQuestion.id] || "";
    if (!code.trim()) {
      toast.error("Please write some code first");
      return;
    }

    setIsRunning(true);
    try {
      // Simulate code execution (in real app, send to backend)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock output
      if (codeLanguage === "python") {
        setCodeOutput("Output: Code executed successfully!\n>>> is_prime(5)\nTrue\n>>> is_prime(4)\nFalse");
      } else {
        setCodeOutput("Compilation successful!\nOutput: Program executed");
      }
      toast.success("✅ Code executed successfully");
    } catch (error) {
      setCodeOutput(`Error: ${error.message}`);
      toast.error("❌ Code execution failed");
    } finally {
      setIsRunning(false);
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleJumpTo = (index) => {
    setCurrentQuestionIndex(index);
  };

  const handleSubmit = () => {
    setSubmitted(true);

    // Calculate score (mock calculation)
    let score = 0;
    let correctAnswers = 0;

    const detailedAnswers = questions.map(q => ({
      questionId: q.id,
      questionText: q.question,
      questionType: q.type,
      userAnswer: answers[q.id] || "",
      correctAnswer: q.correctAnswer || "",
      isCorrect: q.type === "MCQ" ? answers[q.id] === q.correctAnswer : 
                 q.type === "FILL_BLANK" ? answers[q.id]?.toLowerCase() === q.correctAnswer?.toLowerCase() : 
                 false,
      explanation: q.explanation || "",
      solution: q.solution || "Pending manual review",
    }));

    detailedAnswers.forEach(answer => {
      if (answer.isCorrect) {
        if (answer.questionType === "MCQ") {
          score += 2;
          correctAnswers += 1;
        } else if (answer.questionType === "FILL_BLANK") {
          score += 1;
          correctAnswers += 1;
        }
      }
    });

    const totalScore = score;
    const percentageScore = (totalScore / (questions.length * 2)) * 100;

    // Clean up camera when exam is submitted
    setCameraActive(false);
    if (detectionRef.current && detectionRef.current.stream) {
      detectionRef.current.stream.getTracks().forEach(track => track.stop());
    }

    onSubmit({
      questions: detailedAnswers,
      answers,
      totalScore,
      percentageScore: Math.round(percentageScore),
      correctAnswers,
      totalQuestions: questions.length,
      timeSpent: examAttempt.config.duration * 60 - timeRemaining,
      violations,
      proctoringEnabled: config.enableProctoring,
      copyAttempts,
      pasteAttempts,
    });
  };

  if (!currentQuestion) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p>No questions available for this exam configuration.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div>
      {/* Camera Feed - Fixed Position in Corner */}
          {config.enableProctoring && cameraActive && (
        <div className="fixed top-4 right-4 z-50 border-2 border-red-500 rounded-lg overflow-hidden bg-black shadow-lg w-40 h-40">
          <WebcamCapture 
            onCapture={(imageData) => {
              setFaceVerified(true);
              // Store proctoring snapshot if needed
            }}
            onStream={handleStream}
            showLabel={false}
          />
          <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-red-600 text-white px-2 py-1 rounded text-xs font-bold">
            <Camera className="w-3 h-3 animate-pulse" />
            Live
          </div>
        </div>
      )}

      <div className="grid grid-cols-4 gap-6">
      {/* Main Exam Area */}
      <div className="col-span-3 space-y-6">
        {/* Header */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold">Question {currentQuestionIndex + 1} of {questions.length}</h2>
                <p className="text-sm text-muted-foreground">
                  {currentQuestion.type === "MCQ" && "Multiple Choice"}
                  {currentQuestion.type === "CODING" && "Coding Problem"}
                  {currentQuestion.type === "SUBJECTIVE" && "Subjective Question"}
                  {currentQuestion.type === "FILL_BLANK" && "Fill in the Blank"}
                </p>
              </div>
              <div className="flex gap-6 items-center">
                {config.enableProctoring && (
                  <div className="space-y-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCameraActive(!cameraActive)}
                      className="flex items-center gap-2"
                    >
                      {cameraActive ? (
                        <>
                          <Camera className="h-4 w-4" />
                          Hide Camera
                        </>
                      ) : (
                        <>
                          <CameraOff className="h-4 w-4" />
                          Show Camera
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={async () => {
                        await toggleFullscreen();
                        setIsFullscreen(prev => !prev);
                      }}
                      className="flex items-center gap-2"
                    >
                      <Lock className="h-4 w-4" />
                      {isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
                    </Button>
                    <div className="flex items-center gap-2">
                      {isFullscreen ? (
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      ) : (
                        <AlertTriangle className="h-5 w-5 text-red-600" />
                      )}
                      <span className="text-sm font-semibold">
                        {isFullscreen ? "Fullscreen" : "Exit Fullscreen"}
                      </span>
                    </div>
                    {violations.length > 0 && (
                      <div className="flex items-center gap-2 text-orange-600">
                        <AlertTriangle className="h-5 w-5" />
                        <span className="text-sm">⚠ {violations.length} violation(s)</span>
                      </div>
                    )}
                  </div>
                )}
                <div className={`text-3xl font-bold ${isTimeWarning ? "text-red-600" : "text-green-600"}`}>
                  {minutes.toString().padStart(2, "0")}:{seconds.toString().padStart(2, "0")}
                </div>
              </div>
            </div>
            <Progress value={progress} className="h-2" />
          </CardContent>
        </Card>

        {/* Question */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">{currentQuestion.question}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* MCQ Options */}
            {currentQuestion.type === "MCQ" && (
              <RadioGroup value={answers[currentQuestion.id] || ""} onValueChange={handleAnswerChange}>
                <div className="space-y-3">
                  {currentQuestion.options.map((option, idx) => (
                    <div key={idx} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-accent cursor-pointer">
                      <RadioGroupItem value={option} id={`option-${idx}`} />
                      <Label htmlFor={`option-${idx}`} className="cursor-pointer flex-1">
                        {option}
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            )}

            {/* Coding Question */}
            {currentQuestion.type === "CODING" && (
              <div className="space-y-4">
                {/* Language Selection & Sample Input/Output */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="language">Programming Language</Label>
                    <Select value={codeLanguage} onValueChange={setCodeLanguage}>
                      <SelectTrigger id="language">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="python">Python</SelectItem>
                        <SelectItem value="javascript">JavaScript</SelectItem>
                        <SelectItem value="java">Java</SelectItem>
                        <SelectItem value="cpp">C++</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Sample Input</Label>
                    <div className="p-2 bg-slate-100 rounded text-sm font-mono overflow-auto max-h-20">
                      {currentQuestion.sampleInput || "No sample input"}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Expected Output</Label>
                    <div className="p-2 bg-slate-100 rounded text-sm font-mono overflow-auto max-h-20">
                      {currentQuestion.sampleOutput || "No expected output"}
                    </div>
                  </div>
                </div>

                {/* Code Editor */}
                <div className="space-y-2">
                  <Label>Write Your Code</Label>
                  <MonacoEditor
                    height="300px"
                    defaultLanguage={currentQuestion.language || "python"}
                    language={codeLanguage}
                    value={answers[currentQuestion.id] || currentQuestion.template || ""}
                    onChange={(value) => handleAnswerChange(value)}
                    theme="vs-dark"
                    options={{
                      minimap: { enabled: false },
                      lineNumbers: "on",
                      automaticLayout: true,
                      tabSize: 2,
                      wordWrap: "on",
                    }}
                  />
                </div>

                {/* Run Code Button */}
                <Button
                  onClick={handleRunCode}
                  disabled={isRunning}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  <Play className="w-4 h-4 mr-2" />
                  {isRunning ? "Running..." : "Run Code"}
                </Button>

                {/* Code Output */}
                {codeOutput && (
                  <div className="space-y-2">
                    <Label>Output</Label>
                    <div className="p-3 bg-slate-900 text-slate-100 rounded text-sm font-mono overflow-auto max-h-32 whitespace-pre-wrap">
                      {codeOutput}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Subjective Question */}
            {currentQuestion.type === "SUBJECTIVE" && (
              <Textarea
                placeholder="Write your answer here..."
                value={answers[currentQuestion.id] || ""}
                onChange={(e) => handleAnswerChange(e.target.value)}
                className="h-40"
              />
            )}

            {/* Fill in the Blank */}
            {currentQuestion.type === "FILL_BLANK" && (
              <Input
                type="text"
                placeholder="Fill in the blank..."
                value={answers[currentQuestion.id] || ""}
                onChange={(e) => handleAnswerChange(e.target.value)}
                className="text-lg p-3"
              />
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between gap-4">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
          >
            Previous
          </Button>

          {currentQuestionIndex < questions.length - 1 ? (
            <Button onClick={handleNext}>
              Next
            </Button>
          ) : (
            <Button 
              onClick={handleSubmit}
              className="bg-green-600 hover:bg-green-700"
            >
              Submit Exam
            </Button>
          )}
        </div>
      </div>

      {/* Sidebar - Question Navigator */}
      <Card className="h-fit sticky top-20">
        <CardHeader>
          <CardTitle>Questions</CardTitle>
          <CardDescription>
            {Object.keys(answers).length} of {questions.length} answered
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-2">
            {questions.map((q, idx) => (
              <button
                key={q.id}
                onClick={() => handleJumpTo(idx)}
                className={`
                  aspect-square rounded-lg font-bold text-sm
                  flex items-center justify-center
                  ${currentQuestionIndex === idx ? "ring-2 ring-primary" : ""}
                  ${answers[q.id] ? "bg-green-100 text-green-900" : "bg-slate-100 text-slate-600"}
                  hover:opacity-80
                `}
              >
                {idx + 1}
              </button>
            ))}
          </div>

          <div className="mt-6 space-y-3 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-green-100" />
              <span>Answered</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-slate-100" />
              <span>Not Answered</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
    </div>
  );
}
