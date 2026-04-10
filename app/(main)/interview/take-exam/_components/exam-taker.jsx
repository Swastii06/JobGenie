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
import { AlertCircle, Clock, CheckCircle2, Eye, AlertTriangle, Eye as EyeOff, Lock, Camera, CameraOff } from "lucide-react";
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
        question: "Given a string `s`, find the length of the longest substring without repeating characters.\n\nExample:\nInput: \"abcabcbb\"\nOutput: 3\nExplanation: The answer is \"abc\", with the length of 3.",
        templates: {
          python: "def lengthOfLongestSubstring(s):\n    # TODO: Implement the sliding window approach\n    # Use a dictionary to track character positions\n    # Return the maximum length found\n    pass",
          javascript: "function lengthOfLongestSubstring(s) {\n    // TODO: Implement the sliding window approach\n    // Use a Map to track character positions\n    // Return the maximum length found\n}",
          java: "public class Solution {\n    public int lengthOfLongestSubstring(String s) {\n        // TODO: Implement the sliding window approach\n        // Use HashMap for character tracking\n        // Return max length\n    }\n}",
          cpp: "#include <iostream>\n#include <unordered_map>\nusing namespace std;\n\nint lengthOfLongestSubstring(string s) {\n    // TODO: Implement the sliding window approach\n    // Use unordered_map for character positions\n    // Return max length\n}"
        },
        language: "python",
        sampleInput: "\"abcabcbb\"",
        sampleOutput: "3",
        testCases: [
          { input: "abcabcbb", expectedOutput: "3" },
          { input: "bbbbb", expectedOutput: "1" },
          { input: "pwwkew", expectedOutput: "3" },
          { input: "au", expectedOutput: "2" },
          { input: "", expectedOutput: "0" },
        ],
        explanation: "Use a sliding window with a hash map to track character indices. Whenever you encounter a repeating character, move the start pointer to skip the previous occurrence.",
      },
      {
        id: 6,
        type: "CODING",
        question: "Given an array of integers `nums` and an integer `target`, return the indices of the two numbers that add up to the target.\n\nExample:\nInput: nums = [2,7,11,15], target = 9\nOutput: [0,1]\nExplanation: nums[0] + nums[1] = 2 + 7 = 9",
        templates: {
          python: "def twoSum(nums, target):\n    # TODO: Use a hash map to track seen numbers\n    # For each number, check if (target - number) exists\n    # Return indices of the two numbers\n    pass",
          javascript: "function twoSum(nums, target) {\n    // TODO: Use a Map to track seen numbers\n    // For each number, check if (target - number) exists\n    // Return indices of the two numbers\n}",
          java: "public class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        // TODO: Use HashMap for tracking numbers\n        // For each number, check if complement exists\n        // Return indices array\n    }\n}",
          cpp: "#include <iostream>\n#include <unordered_map>\n#include <vector>\nusing namespace std;\n\nvector<int> twoSum(vector<int>& nums, int target) {\n    // TODO: Use unordered_map for tracking\n    // For each number, check if complement exists\n    // Return indices vector\n}"
        },
        language: "python",
        sampleInput: "[2,7,11,15], 9",
        sampleOutput: "[0,1]",
        testCases: [
          { input: "2 7 11 15 9", expectedOutput: "0 1" },
          { input: "3 2 4 6", expectedOutput: "1 2" },
          { input: "3 3 6", expectedOutput: "0 1" },
        ],
        explanation: "Use a hash map to store numbers you've seen. For each number, check if (target - number) exists in the hash map. Time complexity: O(n), Space: O(n)",
      },
      {
        id: 7,
        type: "CODING",
        question: "Given a string `s` containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.\n\nExample:\nInput: \"()\"\nOutput: true\nInput: \"([)]\" \nOutput: false",
        templates: {
          python: "def isValid(s):\n    # TODO: Use a stack to match brackets\n    # Push opening brackets onto stack\n    # For closing brackets, check if matching opening bracket is at top\n    pass",
          javascript: "function isValid(s) {\n    // TODO: Use a stack to match brackets\n    // Push opening brackets onto stack\n    // For closing brackets, check if matching opening bracket is at top\n}",
          java: "public class Solution {\n    public boolean isValid(String s) {\n        // TODO: Use Stack for bracket matching\n        // Push opening brackets onto stack\n        // For closing brackets, check top of stack\n    }\n}",
          cpp: "#include <iostream>\n#include <stack>\nusing namespace std;\n\nbool isValid(string s) {\n    // TODO: Use stack for bracket matching\n    // Push opening brackets\n    // For closing brackets, check top of stack\n}"
        },
        language: "python",
        sampleInput: "\"()\"",
        sampleOutput: "True",
        testCases: [
          { input: "()", expectedOutput: "True" },
          { input: "()[]{}", expectedOutput: "True" },
          { input: "([)]", expectedOutput: "False" },
          { input: "{[]}", expectedOutput: "True" },
          { input: "([{}])", expectedOutput: "True" },
        ],
        explanation: "Use a stack to match opening and closing brackets. Push opening brackets onto the stack, and when you encounter a closing bracket, check if it matches the top of the stack.",
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

export default function ExamTaker({ examAttempt, onSubmit, onQuit, isReviewing = false }) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeRemaining, setTimeRemaining] = useState(examAttempt.config.duration * 60);
  const [submitted, setSubmitted] = useState(false);
  const [violations, setViolations] = useState([]);
  const [isPageVisible, setIsPageVisible] = useState(true);
  const [codeLanguage, setCodeLanguage] = useState("python");
  const [showHints, setShowHints] = useState(false);
  const [codingHintsByQuestionId, setCodingHintsByQuestionId] = useState({});
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showFullscreenDisclaimer, setShowFullscreenDisclaimer] = useState(false);
  const [copyAttempts, setCopyAttempts] = useState(0);
  const [pasteAttempts, setPasteAttempts] = useState(0);
  const [cameraActive, setCameraActive] = useState(false);
  const [faceVerified, setFaceVerified] = useState(false);
  const detectionRef = useRef(null);

  // Use questions and config from examAttempt
  const config = examAttempt.config;
  const questions = config.questions || [];

  // Auto-detect language from templates when question changes
  useEffect(() => {
    setShowHints(false);
    if (questions.length > 0) {
      const currentQuestion = questions[currentQuestionIndex];
      if (currentQuestion && (currentQuestion.type === "CODING" || currentQuestion.type === "SQL")) {
        if (currentQuestion.type === "SQL") {
          setCodeLanguage("sql");
          return;
        }
        // Try to detect language from templates
        const templates = currentQuestion.templates;
        if (typeof templates === 'object' && templates !== null) {
          // Get the first language key from templates object
          const languages = Object.keys(templates).filter(k => templates[k]);
          if (languages.length > 0) {
            setCodeLanguage(languages[0]);
          }
        }
      }
    }
  }, [currentQuestionIndex, questions]);

  // For coding questions: strip TODO/HINT lines from the initial template shown in the editor,
  // but keep them available behind "Show hints". Also ensure the editor is initialized with
  // the cleaned starter code (so hints don't appear inside the editor by default).
  useEffect(() => {
    if (questions.length === 0) return;

    const q = questions[currentQuestionIndex];
    if (!q || (q.type !== "CODING" && q.type !== "SQL")) return;

    setShowHints(false);

    const normalize = (s) => String(s || "").replace(/\r\n/g, "\n").trim();

    const rawTemplate =
      q.templates?.[codeLanguage] ||
      q.templates?.python ||
      (typeof q.templates === "string" ? q.templates : "") ||
      q.template ||
      "";

    const extracted = extractHintsFromTemplate(rawTemplate);

    setCodingHintsByQuestionId((prev) => ({
      ...prev,
      [q.id]: extracted.hints,
    }));

    setAnswers((prev) => {
      const existing = typeof prev[q.id] === "string" ? prev[q.id] : "";

      // If user already typed something non-template-ish, don't overwrite.
      // But if the stored value is still basically the starter template (including old TODOs),
      // replace it with the cleaned template so hints don't show in-editor.
      const existingNorm = normalize(existing);
      const rawNorm = normalize(rawTemplate);
      const cleanedNorm = normalize(extracted.code);

      const looksLikeUneditedStarter =
        existingNorm === "" ||
        existingNorm === rawNorm ||
        existingNorm === cleanedNorm ||
        // common case: previous runs saved the template containing TODO/HINT scaffolding
        (/(\bTODO\b|\bHINT\b|#\s*(if|otherwise|return|use|check|implement)\b|\/\/\s*(if|otherwise|return|use|check|implement)\b)/i.test(existingNorm) &&
          existingNorm.length <= rawNorm.length + 120);

      if (!looksLikeUneditedStarter) return prev;
      return { ...prev, [q.id]: extracted.code };
    });
  }, [currentQuestionIndex, questions, codeLanguage]);

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
              timestamp: new Date().toISOString(),
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

  // Fullscreen requirement on mount with retry logic
  useEffect(() => {
    if (!config.enableProctoring || submitted) return;

    let retryCount = 0;
    const maxRetries = 3;
    const retryDelay = 1000; // 1 second

    const requestFullscreen = async () => {
      try {
        const element = document.documentElement;
        
        // Try different fullscreen APIs for cross-browser support
        if (element.requestFullscreen) {
          await element.requestFullscreen();
          console.log("✓ Fullscreen enabled successfully");
          toast.success("✓ Fullscreen enabled for proctored exam");
        } else if (element.webkitRequestFullscreen) {
          await element.webkitRequestFullscreen();
          console.log("✓ Fullscreen enabled (webkit)");
        } else if (element.mozRequestFullScreen) {
          await element.mozRequestFullScreen();
          console.log("✓ Fullscreen enabled (moz)");
        } else if (element.msRequestFullscreen) {
          await element.msRequestFullscreen();
          console.log("✓ Fullscreen enabled (ms)");
        }
      } catch (err) {
        console.warn(`Fullscreen request failed (attempt ${retryCount + 1}):`, err.message);
        
        // Retry up to maxRetries times with exponential backoff
        if (retryCount < maxRetries) {
          retryCount++;
          setTimeout(() => {
            requestFullscreen();
          }, retryDelay * retryCount);
        } else {
          // After max retries, show a user-friendly message but allow exam to continue
          toast.warning("⚠️ Full-screen mode is recommended for proctored exams for better security. Please enable it in your browser settings.");
        }
      }
    };

    // Delay initial fullscreen request slightly to allow page to fully render
    const timeoutId = setTimeout(() => {
      requestFullscreen();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [config.enableProctoring, submitted]);

  // Initialize camera when proctoring is enabled
  useEffect(() => {
    if (config.enableProctoring && !submitted) {
      setCameraActive(true);
      
      // Request camera after fullscreen is in effect (with a delay)
      const cameraInitTimeout = setTimeout(() => {
        toast.info("📷 Starting proctoring camera...");
      }, 1000);

      // Cleanup: Stop camera on exam submission or unmount
      return () => {
        clearTimeout(cameraInitTimeout);
        if (submitted || config.enableProctoring === false) {
          setCameraActive(false);
          // Stop all media streams
          if (detectionRef.current && detectionRef.current.stream) {
            detectionRef.current.stream.getTracks().forEach(track => track.stop());
            detectionRef.current.stream = null;
          }
        }
      };
    }
  }, [config.enableProctoring, submitted]);

  // Proctoring: Detect tab switches, window blur, etc.
  useEffect(() => {
    const handleVisibilityChange = () => {
      const isVisible = document.visibilityState === "visible";
      setIsPageVisible(isVisible);

      if (!isVisible && config.enableProctoring && !submitted) {
        const violation = {
          type: "TAB_SWITCH",
          timestamp: new Date().toISOString(),
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
      
      // Show disclaimer when exiting fullscreen
      if (!isCurrentlyFullscreen && config.enableProctoring && !submitted) {
        setShowFullscreenDisclaimer(true);
      } else {
        setShowFullscreenDisclaimer(false);
      }
      
      // Grace period: Don't record violation immediately (permission dialogs may cause temporary exit)
      if (!isCurrentlyFullscreen && config.enableProctoring && !submitted && cameraActive) {
        // Add a delay to check if fullscreen exits due to permission dialog
        setTimeout(() => {
          const stillNotFullscreen = !(document.fullscreenElement || document.webkitFullscreenElement);
          const isPageHidden = document.hidden;
          
          // Only record violation if still not fullscreen after grace period and page is still visible
          if (stillNotFullscreen && !isPageHidden) {
            const violation = {
              type: "FULLSCREEN_EXIT",
              timestamp: new Date().toISOString(),
              details: `Exited fullscreen at ${new Date().toLocaleTimeString()}`
            };
            setViolations(prev => [...prev, violation]);
            toast.error(`❌ You must remain in fullscreen mode!`);
            
            // Auto-re-request fullscreen after recording violation
            setTimeout(() => {
              const element = document.documentElement;
              if (element.requestFullscreen) {
                element.requestFullscreen().catch(err => {
                  console.warn("Failed to re-enter fullscreen:", err.message);
                });
              }
            }, 1000);
          }
        }, 1500); // 1.5 second grace period for dialogs
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
          timestamp: new Date().toISOString(),
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
          timestamp: new Date().toISOString(),
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
          timestamp: new Date().toISOString(),
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

  // Proctoring: Comprehensive screenshot prevention
  useEffect(() => {
    if (!config.enableProctoring || submitted) return;

    // 1. Prevent Print Screen using multiple methods
    const handlePrintScreenBlock = (e) => {
      // Method 1: Check key
      if (e.key === 'PrintScreen' || e.code === 'PrintScreen') {
        e.preventDefault();
        e.stopPropagation();
        toast.error("❌ Screenshots are blocked");
        return false;
      }

      // Method 2: Check keyCode (44 = Print Screen, 42 = Shift+Print Screen shift codes)
      if (e.keyCode === 44 || e.keyCode === 42) {
        e.preventDefault();
        e.stopImmediatePropagation();
        toast.error("❌ Screenshots are blocked");
        return false;
      }

      // Method 3: Windows + Shift + S (modern screenshot tool)
      if (e.shiftKey && (e.metaKey || e.ctrlKey === false) && 
          (e.key === 's' || e.key === 'S' || e.code === 'KeyS')) {
        if (e.location === 0 && (e.getModifierState?.('Meta') || e.getModifierState?.('Windows'))) {
          e.preventDefault();
          e.stopImmediatePropagation();
          toast.error("❌ Screenshot tool blocked");
          return false;
        }
      }

      return null;
    };

    // 2. Block at multiple event phases
    window.addEventListener('keydown', handlePrintScreenBlock, { capture: true });
    document.addEventListener('keydown', handlePrintScreenBlock, { capture: true });
    document.addEventListener('keypress', handlePrintScreenBlock, { capture: true });

    // 3. Block Print Screen at OS level using hidden overlay
    const createScreenshotBlocker = () => {
      const blocker = document.createElement('div');
      blocker.id = 'screenshot-blocker';
      blocker.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(45deg, rgba(0,0,0,0.01) 25%, transparent 25%, transparent 75%, rgba(0,0,0,0.01) 75%, rgba(0,0,0,0.01)),
                    linear-gradient(45deg, rgba(0,0,0,0.01) 25%, transparent 25%, transparent 75%, rgba(0,0,0,0.01) 75%, rgba(0,0,0,0.01));
        background-size: 2px 2px;
        background-position: 0 0, 1px 1px;
        pointer-events: none;
        z-index: -1;
        font-family: Arial, sans-serif;
        opacity: 0.02;
        mix-blend-mode: multiply;
        word-break: break-all;
        white-space: pre-wrap;
        content: '';
        will-change: none;
      `;
      blocker.innerHTML = '⚠️ PROCTORED EXAM - UNAUTHORIZED RECORDING/SCREENSHOT';
      blocker.setAttribute('data-screenshot-protected', 'true');
      document.body.appendChild(blocker);
    };
    createScreenshotBlocker();

    // 4. Detect canvas fingerprinting (used by some screenshot tools)
    const origGetElementById = document.getElementById;
    document.getElementById = function(id) {
      if (id && (id.includes('canvas') || id.includes('screen') || id.includes('capture'))) {
        console.warn('Canvas element access detected - possible screenshot attempt');
        const violation = {
          type: 'SCREENSHOT_CANVAS_ATTEMPT',
          timestamp: new Date().toISOString(),
          details: `Canvas element access attempt: ${id}`
        };
        setViolations(prev => [...prev, violation]);
      }
      return origGetElementById.call(this, id);
    };

    // 5. Prevent common screenshot hotkeys
    const screenshotHotkeys = {
      'PrintScreen': [44],
      'AltPrintScreen': [44],
      'ShiftPrintScreen': [44],
      'Ctrl+PrintScreen': [44],
      'Cmd+Shift+4': null, // Mac screenshot (can't block in browser)
      'Cmd+Shift+5': null, // Mac screenshot (can't block in browser)
    };

    const preventScreenshotHotkeys = (e) => {
      // Block all print screen variations
      if (e.keyCode === 44 || e.key === 'PrintScreen') {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        
        const violation = {
          type: 'SCREENSHOT_HOTKEY_BLOCKED',
          timestamp: new Date().toISOString(),
          details: `Screenshot hotkey blocked: KeyCode=${e.keyCode}, Key=${e.key}`
        };
        setViolations(prev => [...prev, violation]);
        toast.error('❌ Screenshots disabled');
        return false;
      }
      
      // Block Windows + Shift + S (Windows Snip & Sketch)
      if (e.shiftKey && (e.metaKey || e.key === 'Meta') && (e.key === 's' || e.code === 'KeyS')) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        
        const violation = {
          type: 'WINDOWS_SNIP_BLOCKED',
          timestamp: new Date().toISOString(),
          details: `Windows Snip & Sketch blocked at ${new Date().toLocaleTimeString()}`
        };
        setViolations(prev => [...prev, violation]);
        toast.error('❌ Screenshot tool blocked');
        return false;
      }
      
      // Block Ctrl/Cmd + Alt + S (Alternative screenshot shortcut)
      if ((e.ctrlKey || e.metaKey) && e.altKey && (e.key === 's' || e.code === 'KeyS')) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        
        const violation = {
          type: 'ALT_SCREENSHOT_BLOCKED',
          timestamp: new Date().toISOString(),
          details: `Alternative screenshot hotkey blocked at ${new Date().toLocaleTimeString()}`
        };
        setViolations(prev => [...prev, violation]);
        toast.error('❌ Screenshot blocked');
        return false;
      }
    };

    window.addEventListener('keydown', preventScreenshotHotkeys, true);
    document.addEventListener('keydown', preventScreenshotHotkeys, true);

    // 6. Disable drag and copy operations (often used with screenshots)
    const preventExtraction = (e) => {
      e.preventDefault();
      e.stopImmediatePropagation();
      return false;
    };

    document.addEventListener('dragstart', preventExtraction, true);
    document.addEventListener('drag', preventExtraction, true);
    document.addEventListener('copy', preventExtraction, true);
    document.addEventListener('cut', preventExtraction, true);

    // 7. Override common screenshot methods
    if (navigator.mediaDevices) {
      const originalGetDisplayMedia = navigator.mediaDevices.getDisplayMedia;
      navigator.mediaDevices.getDisplayMedia = async function() {
        const violation = {
          type: 'SCREEN_CAPTURE_API_ATTEMPT',
          timestamp: new Date().toISOString(),
          details: `Screen Capture API attempted at ${new Date().toLocaleTimeString()}`
        };
        setViolations(prev => [...prev, violation]);
        toast.error('❌ Screen recording tools are blocked');
        throw new Error('Screen recording is disabled during exam');
      };
    }

    // 8. Detect and block notification API (sometimes used to extract content)
    const originalNotification = window.Notification;
    if (originalNotification) {
      window.Notification = class ProtectedNotification extends originalNotification {
        constructor(title, options) {
          console.warn('Notification API blocked during exam');
          throw new Error('Notifications are disabled');
        }
      };
    }

    // 9. Block clipboard access for theft
    if (navigator.clipboard) {
      const originalRead = navigator.clipboard.read;
      const originalReadText = navigator.clipboard.readText;
      
      navigator.clipboard.read = async function() {
        throw new Error('Clipboard read is disabled');
      };
      
      navigator.clipboard.readText = async function() {
        throw new Error('Clipboard read is disabled');
      };
    }

    // Cleanup
    return () => {
      window.removeEventListener('keydown', handlePrintScreenBlock, true);
      document.removeEventListener('keydown', handlePrintScreenBlock, true);
      document.removeEventListener('keypress', handlePrintScreenBlock, true);
      window.removeEventListener('keydown', preventScreenshotHotkeys, true);
      document.removeEventListener('keydown', preventScreenshotHotkeys, true);
      document.removeEventListener('dragstart', preventExtraction, true);
      document.removeEventListener('drag', preventExtraction, true);
      document.removeEventListener('copy', preventExtraction, true);
      document.removeEventListener('cut', preventExtraction, true);
      
      const blocker = document.getElementById('screenshot-blocker');
      if (blocker) blocker.remove();
    };
  }, [config.enableProctoring, submitted]);

  // Proctoring: Prevent screen recording and screen capture tools
  useEffect(() => {
    if (!config.enableProctoring || submitted) return;

    // Prevent drag and drop (prevents extraction of content)
    const preventDrag = (e) => {
      if (config.enableProctoring && !submitted) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    // Prevent pointer events that could trigger screenshots
    const preventPointer = (e) => {
      // Block if user tries to hold Print Screen
      if (e.type === 'pointerdown' || e.type === 'pointerup') {
        // This catches some screenshot tool attempts
      }
    };

    // Block drag operations
    document.addEventListener('dragstart', preventDrag, true);
    document.addEventListener('drag', preventDrag, true);
    document.addEventListener('dragend', preventDrag, true);
    document.addEventListener('drop', preventDrag, true);

    // Check for recording tools in user agent
    const hasRecordingTools = 
      navigator.userAgent.toLowerCase().includes('bandicam') ||
      navigator.userAgent.toLowerCase().includes('fraps') ||
      navigator.userAgent.toLowerCase().includes('screenflick') ||
      navigator.userAgent.toLowerCase().includes('camtasia');

    if (hasRecordingTools) {
      const violation = {
        type: 'RECORDING_TOOL_DETECTED',
        timestamp: new Date().toISOString(),
        details: `Screen recording tool detected at ${new Date().toLocaleTimeString()}`
      };
      setViolations(prev => [...prev, violation]);
      toast.warning("⚠️ Screen recording tools detected and prohibited");
    }

    return () => {
      document.removeEventListener('dragstart', preventDrag, true);
      document.removeEventListener('drag', preventDrag, true);
      document.removeEventListener('dragend', preventDrag, true);
      document.removeEventListener('drop', preventDrag, true);
    };
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

  // Debug logging
  if (questions.length === 0) {
    console.log("DEBUG [exam-taker]: No questions available. config:", config);
    console.log("DEBUG [exam-taker]: examAttempt:", examAttempt);
  } else {
    console.log("DEBUG [exam-taker]: Loaded", questions.length, "questions");
    console.log("DEBUG [exam-taker]: Current question index:", currentQuestionIndex);
    console.log("DEBUG [exam-taker]: Current question:", currentQuestion);
    
    // Debug coding question template structure
    if (currentQuestion?.type === "CODING" || currentQuestion?.type === "SQL") {
      console.log("DEBUG [exam-taker]: Coding question templates structure:");
      console.log("  - templates object:", currentQuestion.templates);
      console.log("  - template (single):", currentQuestion.template);
      console.log("  - language:", currentQuestion.language);
      console.log("  - sqlDialect:", currentQuestion.sqlDialect);
      console.log("  - codeLanguage state:", codeLanguage);
    }
  }

  const handleAnswerChange = (value) => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: value,
    }));
  };

  const requestFullscreenMode = async () => {
    try {
      const element = document.documentElement;
      if (element.requestFullscreen) {
        await element.requestFullscreen();
      } else if (element.webkitRequestFullscreen) {
        await element.webkitRequestFullscreen();
      } else if (element.mozRequestFullScreen) {
        await element.mozRequestFullScreen();
      } else if (element.msRequestFullscreen) {
        await element.msRequestFullscreen();
      }
      setShowFullscreenDisclaimer(false);
      toast.success("✓ Fullscreen enabled");
    } catch (err) {
      console.error("Fullscreen request failed:", err);
      toast.error("Failed to enter fullscreen mode");
    }
  };

  const renderDisplayValue = (value) => {
    if (value == null) return "";
    if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
      return String(value);
    }
    try {
      return JSON.stringify(value, null, 2);
    } catch {
      return String(value);
    }
  };

  const extractHintsFromTemplate = (template) => {
    if (typeof template !== "string" || !template.trim()) {
      return { code: template || "", hints: [] };
    }

    const lines = template.split("\n");
    const hints = [];
    const kept = [];

    const isInstructionalComment = (trimmedLine) => {
      // Preserve C/C++ preprocessor directives
      if (/^#\s*(include|define|ifn?def|endif|pragma|import)\b/i.test(trimmedLine)) {
        return false;
      }

      // Only comment lines are candidates
      if (!/^(#|\/\/|\*|\/\*)\s*/.test(trimmedLine)) return false;

      // Instruction-style hints
      return /\b(TODO|HINT|implement|return|calculate|check|iterate|loop|use|write|solve|create|find|determine|if\s|otherwise)\b/i.test(
        trimmedLine
      );
    };

    for (const line of lines) {
      const trimmed = line.trim();
      const isTodoOrHint = isInstructionalComment(trimmed);

      if (isTodoOrHint) {
        hints.push(trimmed.replace(/^(\#|\/\/|\*|\/\*)\s*/, "").trim());
        continue;
      }

      kept.push(line);
    }

    // Trim leading/trailing blank lines after stripping hints
    while (kept.length > 0 && kept[0].trim() === "") kept.shift();
    while (kept.length > 0 && kept[kept.length - 1].trim() === "") kept.pop();

    return { code: kept.join("\n") + "\n", hints };
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

  const stopAllMediaNow = () => {
    // Stop detection stream
    if (detectionRef.current?.stream) {
      try {
        detectionRef.current.stream.getTracks().forEach((track) => {
          track.stop();
        });
        detectionRef.current.stream = null;
      } catch (e) {
        console.error("[ExamTaker] Error stopping detection stream:", e);
      }
    }

    // Stop all video/audio elements
    try {
      document.querySelectorAll("video").forEach((v) => {
        try {
          if (v?.srcObject) {
            v.srcObject.getTracks().forEach((t) => t.stop());
            v.srcObject = null;
          }
          v.pause?.();
        } catch (e) {
          console.error("[ExamTaker] Error stopping video:", e);
        }
      });

      document.querySelectorAll("audio").forEach((a) => {
        try {
          if (a?.srcObject) {
            a.srcObject.getTracks().forEach((t) => t.stop());
            a.srcObject = null;
          }
          a.pause?.();
        } catch (e) {
          console.error("[ExamTaker] Error stopping audio:", e);
        }
      });
    } catch (e) {
      console.error("[ExamTaker] Error stopping media elements:", e);
    }

    setCameraActive(false);

    // Try to exit fullscreen (best-effort)
    try {
      if (document.fullscreenElement) document.exitFullscreen?.();
    } catch (e) {
      // ignore
    }
  };

  // Confirm before leaving exam (browser back / refresh / close)
  useEffect(() => {
    if (submitted || isReviewing) return;

    // Add a trap state so back triggers popstate while keeping user on page
    try {
      window.history.pushState({ examGuard: true }, "");
    } catch {
      // ignore
    }

    const onBeforeUnload = (e) => {
      e.preventDefault();
      // Chrome requires returnValue to be set
      e.returnValue = "";
      return "";
    };

    const onPopState = () => {
      const ok = window.confirm(
        "Quit the exam?\n\n- Press OK to terminate the exam and return to settings.\n- Press Cancel to continue the exam."
      );

      if (!ok) {
        // Stay on the exam: re-push trap state
        try {
          window.history.pushState({ examGuard: true }, "");
        } catch {
          // ignore
        }
        return;
      }

      // Quit: cleanup then return to configuration screen
      stopAllMediaNow();
      onQuit?.();
    };

    window.addEventListener("beforeunload", onBeforeUnload);
    window.addEventListener("popstate", onPopState);

    return () => {
      window.removeEventListener("beforeunload", onBeforeUnload);
      window.removeEventListener("popstate", onPopState);
    };
  }, [submitted, isReviewing, onQuit]);

  const handleSubmit = () => {
    const ok = window.confirm("Submit exam now?\n\nYou won't be able to change your answers after submitting.");
    if (!ok) return;

    setSubmitted(true);

    // IMMEDIATE cleanup: Stop camera and audio streams NOW
    console.log("[ExamTaker] Submitting exam - cleaning up streams");

    stopAllMediaNow();

    // Calculate score (mock calculation)
    let score = 0;
    let correctAnswers = 0;

    const resolveSolution = (q) => {
      if (q.solution && q.solution !== "Pending manual review") return q.solution;

      // For coding, prefer code templates over verbal explanation
      if (q.type === "CODING" || q.type === "SQL") {
        const templateFromMap =
          q.templates?.[codeLanguage] ||
          q.templates?.[q.language] ||
          q.templates?.python;

        if (templateFromMap) return templateFromMap;
        if (typeof q.template === "string" && q.template.trim()) return q.template;
      }

      if (q.explanation) return q.explanation;

      // Prefer language template if available
      const templateFromMap =
        q.templates?.[codeLanguage] ||
        q.templates?.[q.language] ||
        q.templates?.python;

      if (templateFromMap) return templateFromMap;
      if (typeof q.template === "string" && q.template.trim()) return q.template;
      if (q.correctAnswer) return String(q.correctAnswer);
      return "";
    };

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
      solution: resolveSolution(q),
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
    console.log("DEBUG: currentQuestion is null. Questions array:", questions, "Current question index:", currentQuestionIndex);
    return (
      <Card className="border-yellow-600 bg-yellow-50 dark:bg-yellow-950 dark:border-yellow-600">
        <CardContent className="pt-6 space-y-4">
          <div className="flex items-start gap-4">
            <AlertCircle className="h-8 w-8 text-yellow-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-lg text-yellow-900 dark:text-yellow-100">No Questions Available</h3>
              <p className="text-sm text-yellow-800 dark:text-yellow-200 mt-1">
                The exam questions could not be loaded. This might happen if:
              </p>
              <ul className="text-sm text-yellow-800 dark:text-yellow-200 mt-2 space-y-1 ml-4 list-disc">
                <li>The AI service failed to generate questions</li>
                <li>Your configuration requires specific unsupported question types</li>
                <li>There was a network issue during generation</li>
              </ul>
              <button 
                onClick={() => window.history.back()}
                className="mt-4 inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 font-medium transition-colors"
              >
                Go Back & Try Again
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div 
      style={{
        // Prevent screenshots and screen recording
        WebkitUserSelect: config.enableProctoring ? 'none' : 'auto',
        MsUserSelect: config.enableProctoring ? 'none' : 'auto',
        WebkitTouchCallout: config.enableProctoring ? 'none' : 'auto',
      }}
      className={config.enableProctoring ? 'select-none' : ''}
    >
      {/* Fullscreen Disclaimer Overlay */}
      {config.enableProctoring && showFullscreenDisclaimer && !submitted && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[10000] backdrop-blur-md overflow-y-auto">
          <Card className="w-full max-w-xl mx-4 my-4 bg-white dark:bg-slate-950 border-4 border-red-600 shadow-2xl">
            <CardContent className="pt-6 pb-6 space-y-4">
              {/* Warning Icon and Title */}
              <div className="flex flex-col items-center gap-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-red-600 blur-lg opacity-20 rounded-full"></div>
                  <AlertTriangle className="h-16 w-16 text-red-600 relative z-10 animate-pulse" />
                </div>
                <div className="text-center space-y-2">
                  <h2 className="text-2xl font-bold text-red-600">⚠️ FULLSCREEN REQUIRED</h2>
                  <p className="text-base text-slate-700 dark:text-slate-300 font-semibold">
                    This is a proctored exam
                  </p>
                </div>
              </div>

              {/* Disclaimer Text */}
              <div className="space-y-2 bg-red-50 dark:bg-red-950 border-2 border-red-300 dark:border-red-700 rounded-lg p-4">
                <h3 className="text-sm font-bold text-red-700 dark:text-red-300">Why Fullscreen is Required:</h3>
                <ul className="space-y-1 text-slate-700 dark:text-slate-300 text-xs">
                  <li className="flex items-start gap-2">
                    <span className="text-red-600 font-bold mt-0 flex-shrink-0">●</span>
                    <span><strong>Security:</strong> Prevents access to other applications</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-600 font-bold mt-0 flex-shrink-0">●</span>
                    <span><strong>Anti-Cheating:</strong> Blocks screenshots & recording</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-600 font-bold mt-0 flex-shrink-0">●</span>
                    <span><strong>Fair Assessment:</strong> Equal test conditions</span>
                  </li>
                </ul>
              </div>

              {/* Consequences */}
              <div className="bg-orange-50 dark:bg-orange-950 border-2 border-orange-300 dark:border-orange-700 rounded-lg p-3">
                <p className="text-slate-700 dark:text-slate-300 text-xs">
                  <strong>All violations recorded:</strong> Multiple violations may result in exam cancellation or academic penalties.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-3 pt-2">
                <Button
                  onClick={requestFullscreenMode}
                  size="lg"
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition-all duration-200 transform hover:scale-105 py-6"
                >
                  <Lock className="mr-2 h-5 w-5" />
                  Enter Fullscreen & Continue
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Frozen Overlay When Not in Fullscreen (prevents interaction) */}
      {config.enableProctoring && showFullscreenDisclaimer && !submitted && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[9999]" style={{ pointerEvents: 'auto' }} />
      )}
      {/* Loading Overlay - Shows during AI Review */}
      {isReviewing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] backdrop-blur-sm">
          <Card className="w-96 bg-white dark:bg-slate-950 border-2 border-blue-500">
            <CardContent className="pt-8 pb-8 flex flex-col items-center gap-6">
              {/* Spinner Animation */}
              <div className="flex justify-center">
                <div className="relative w-20 h-20">
                  <div className="absolute inset-0 rounded-full border-4 border-slate-200 dark:border-slate-700"></div>
                  <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-500 border-r-blue-500 animate-spin"></div>
                </div>
              </div>
              
              {/* Loading Message */}
              <div className="text-center space-y-2">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  Processing Your Answers
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  AI is reviewing your responses. This may take a few moments...
                </p>
              </div>
              
              {/* Progress Indicator */}
              <div className="w-full space-y-2">
                <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span>Analyzing answers</span>
                  <span id="progress-text">0%</span>
                </div>
                <Progress value={75} className="h-2" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Camera Feed - Fixed Position in Corner (minimal overlay, always visible) */}
      {config.enableProctoring && cameraActive && (
        <div className="fixed top-4 right-4 z-50 border-2 border-red-500 rounded-lg overflow-hidden bg-black shadow-lg w-40 md:w-52 aspect-video transition-transform duration-200 hover:scale-110">
          <WebcamCapture
            minimal
            onCapture={() => {
              // no-op in overlay; frame analysis is handled by parent
            }}
            onStream={handleStream}
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
        {/* Compact exam header with timer and controls */}
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h2 className="text-lg font-semibold">
                  Question {currentQuestionIndex + 1} of {questions.length}
                </h2>
              </div>
              <div className="flex items-center gap-4">
                {config.enableProctoring && (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setCameraActive(!cameraActive)}
                    >
                      {cameraActive ? <Camera className="h-4 w-4" /> : <CameraOff className="h-4 w-4" />}
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={async () => {
                        await toggleFullscreen();
                        setIsFullscreen(prev => !prev);
                      }}
                    >
                      <Lock className="h-4 w-4" />
                    </Button>
                  </div>
                )}
                <div className={`text-2xl font-bold tabular-nums ${isTimeWarning ? "text-red-600" : "text-green-600"}`}>
                  {minutes.toString().padStart(2, "0")}:{seconds.toString().padStart(2, "0")}
                </div>
              </div>
            </div>
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
              <RadioGroup 
                value={answers[currentQuestion.id] || ""} 
                onValueChange={showFullscreenDisclaimer ? undefined : handleAnswerChange}
                disabled={showFullscreenDisclaimer}
              >
                <div className={`space-y-3 ${showFullscreenDisclaimer ? 'opacity-50 pointer-events-none' : ''}`}>
                  {currentQuestion.options.map((option, idx) => (
                    <div 
                      key={idx} 
                      className={`flex items-center space-x-3 p-3 border rounded-lg hover:bg-accent cursor-pointer ${
                        showFullscreenDisclaimer ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      <RadioGroupItem value={option} id={`option-${idx}`} disabled={showFullscreenDisclaimer} />
                      <Label htmlFor={`option-${idx}`} className={`cursor-pointer flex-1 ${
                        showFullscreenDisclaimer ? 'cursor-not-allowed' : ''
                      }`}>
                        {option}
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            )}

            {/* Coding Question */}
            {(currentQuestion.type === "CODING" || currentQuestion.type === "SQL") && (
              <div className={`space-y-4 ${showFullscreenDisclaimer ? 'opacity-50 pointer-events-none' : ''}`}>
                {currentQuestion.type === "SQL" && (
                  <div className="p-2 bg-slate-50 rounded text-sm text-slate-700">
                    SQL Dialect: <span className="font-semibold uppercase">{currentQuestion.sqlDialect || config.preferredSqlDialect || "POSTGRESQL"}</span>
                  </div>
                )}
                {/* Test Cases */}
                <div className="space-y-2">
                  <Label>Test Cases: {currentQuestion.testCases?.length || 0}</Label>
                  <div className="p-2 bg-blue-50 rounded text-sm">
                    {currentQuestion.testCases && currentQuestion.testCases.length > 0 ? (
                      <p className="text-blue-700 font-medium">✓ {currentQuestion.testCases.length} test cases available</p>
                    ) : currentQuestion.sampleInput || currentQuestion.sampleOutput ? (
                      <p className="text-gray-600">Sample input/output provided</p>
                    ) : (
                      <p className="text-gray-600">Write code to solve the problem above</p>
                    )}
                  </div>
                </div>

                {/* Sample Test Case */}
                {(currentQuestion.sampleInput || currentQuestion.sampleOutput) && (
                  <div className="grid grid-cols-2 gap-4 bg-gray-50 p-3 rounded-lg">
                    <div className="space-y-2">
                      <Label className="text-xs text-gray-600">Sample Input</Label>
                      <div className="p-2 bg-white border rounded text-xs font-mono overflow-auto max-h-24 text-black">
                        {renderDisplayValue(currentQuestion.sampleInput) || "(no input example)"}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs text-gray-600">Expected Output</Label>
                      <div className="p-2 bg-white border rounded text-xs font-mono overflow-auto max-h-24 text-black">
                        {renderDisplayValue(currentQuestion.sampleOutput) || "(no output example)"}
                      </div>
                    </div>
                  </div>
                )}

                {/* Code Editor */}
                <div className="space-y-2">
                  <Label>Write Your Code</Label>
                  {(() => {
                    const hintsFromQuestion = Array.isArray(currentQuestion.hints)
                      ? currentQuestion.hints
                      : [];
                    const extractedHints = codingHintsByQuestionId[currentQuestion.id] || [];
                    const mergedHints =
                      hintsFromQuestion.length > 0 ? hintsFromQuestion : extractedHints;
                    
                    return (
                      <>
                        <MonacoEditor
                        height="350px"
                        defaultLanguage={currentQuestion.type === "SQL" ? "sql" : (currentQuestion.language || "python")}
                        language={currentQuestion.type === "SQL" ? "sql" : codeLanguage}
                        value={answers[currentQuestion.id] || ""}
                        onChange={(value) => handleAnswerChange(value)}
                        theme="vs-dark"
                        options={{
                          minimap: { enabled: false },
                          lineNumbers: "on",
                          automaticLayout: true,
                          tabSize: 2,
                          wordWrap: "on",
                          fontSize: 14,
                        }}
                      />

                      {mergedHints.length > 0 && (
                        <div className="pt-2 space-y-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setShowHints((v) => !v)}
                            className="w-full"
                          >
                            {showHints ? "Hide hints" : "Show hints"}
                          </Button>

                          {showHints && (
                            <div className="p-3 bg-slate-50 border rounded-lg text-sm text-slate-800 space-y-2">
                              <div className="font-medium">Hints</div>
                              <ul className="list-disc ml-5 space-y-1">
                                {mergedHints.map((h, idx) => (
                                  <li key={idx}>{h}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}
                    </>
                    );
                  })()}
                </div>

                <div className="p-3 bg-blue-50 rounded-lg text-sm text-blue-800">
                  Your code will be evaluated by AI in the report after you submit.
                </div>
              </div>
            )}

            {/* Subjective Question */}
            {currentQuestion.type === "SUBJECTIVE" && (
              <Textarea
                placeholder="Write your answer here..."
                value={answers[currentQuestion.id] || ""}
                onChange={(e) => showFullscreenDisclaimer ? undefined : handleAnswerChange(e.target.value)}
                disabled={showFullscreenDisclaimer}
                className={`h-40 ${showFullscreenDisclaimer ? 'opacity-50 cursor-not-allowed' : ''}`}
              />
            )}

            {/* Fill in the Blank */}
            {currentQuestion.type === "FILL_BLANK" && (
              <Input
                type="text"
                placeholder="Fill in the blank..."
                value={answers[currentQuestion.id] || ""}
                onChange={(e) => showFullscreenDisclaimer ? undefined : handleAnswerChange(e.target.value)}
                disabled={showFullscreenDisclaimer}
                className={`text-lg p-3 ${showFullscreenDisclaimer ? 'opacity-50 cursor-not-allowed' : ''}`}
              />
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className={`flex justify-between gap-4 ${showFullscreenDisclaimer ? 'opacity-50 pointer-events-none' : ''}`}>
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0 || showFullscreenDisclaimer}
          >
            Previous
          </Button>

          {currentQuestionIndex < questions.length - 1 ? (
            <Button onClick={handleNext} disabled={showFullscreenDisclaimer}>
              Next
            </Button>
          ) : (
            <Button 
              onClick={handleSubmit}
              disabled={isReviewing || showFullscreenDisclaimer}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:hover:bg-gray-400"
            >
              {isReviewing ? "Submitting..." : "Submit Exam"}
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
