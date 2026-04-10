"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

function parseJsonLenient(text) {
  if (typeof text !== "string") {
    throw new Error("AI response was not a string");
  }

  const raw = text.trim();
  if (!raw) throw new Error("AI response was empty");

  // 1) Strip common markdown fences
  const unfenced = raw.replace(/```(?:json)?\s*/gi, "").replace(/```/g, "").trim();

  // 2) Try direct parse first
  try {
    return JSON.parse(unfenced);
  } catch {
    // continue
  }

  // 3) Extract the largest plausible JSON object/array substring
  const firstObj = unfenced.indexOf("{");
  const lastObj = unfenced.lastIndexOf("}");
  const firstArr = unfenced.indexOf("[");
  const lastArr = unfenced.lastIndexOf("]");

  const candidates = [];
  if (firstObj !== -1 && lastObj !== -1 && lastObj > firstObj) {
    candidates.push(unfenced.slice(firstObj, lastObj + 1));
  }
  if (firstArr !== -1 && lastArr !== -1 && lastArr > firstArr) {
    candidates.push(unfenced.slice(firstArr, lastArr + 1));
  }

  for (const c of candidates) {
    try {
      return JSON.parse(c);
    } catch {
      // try next
    }
  }

  // 4) Last resort: remove trailing commas (very common model mistake)
  const withoutTrailingCommas = (candidates[0] || unfenced).replace(/,\s*([}\]])/g, "$1");
  return JSON.parse(withoutTrailingCommas);
}

// Resilient model selection: try a list of candidate models and cache the first
// available one. If the chosen model later returns a 404 (not supported for
// generateContent), we'll attempt the next candidate. This avoids hard failures
// when model names or API versions change.
const CANDIDATE_MODELS = [
  // Preferred Gemini candidates (try more recent first)
  "gemini-2.5-flash",
  "gemini-2.5-pro",
  "gemini-2.5-flash-lite",
  // 2.0 series (common free-tier options)
  "gemini-2.0-flash",
  "gemini-2.0-flash-lite",
  // 1.5 series (more widely available than bare "gemini-1.5")
  "gemini-1.5-flash",
  "gemini-1.5-pro",
  // Newer 3.x series if enabled on the project
  "gemini-3-flash",
  "gemini-3.1-flash-lite",
  // Fallback to text-bison (older text model) if Gemini variants are not available
  "text-bison-001",
  "text-bison",
];

let cachedModelName = null;
let cachedModel = null;

async function chooseModel() {
  if (cachedModel) {
    console.log(">>>>>> [SERVER LOG] Using cached model:", cachedModelName);
    return cachedModel;
  }

  // If the SDK exposes a listModels method, log available models for diagnostics
  try {
    if (typeof genAI.listModels === "function") {
      const list = await genAI.listModels();
      console.log(">>>>>> [SERVER LOG] Available models:", JSON.stringify(list, null, 2));
    }
  } catch (err) {
    // ignore listing errors — we still try candidates below
    console.warn(">>>>>> [SERVER WARN] listModels failed:", err?.message || err);
  }

  console.log(">>>>>> [SERVER LOG] Attempting to select model from candidates:", CANDIDATE_MODELS);

  for (const name of CANDIDATE_MODELS) {
    try {
      console.log(">>>>>> [SERVER LOG] Trying model:", name);
      const m = genAI.getGenerativeModel({ model: name });
      // Test a no-op call if the SDK provides a quick validation method. If not,
      // we optimistically select the model and handle errors on generate.
      cachedModelName = name;
      cachedModel = m;
      console.log(">>>>>> [SERVER LOG] Successfully selected generative model:", name);
      return cachedModel;
    } catch (err) {
      console.warn(">>>>>> [SERVER WARN] model not available:", name, (err && err.message) || err);
      // try next candidate
    }
  }

  // If none selected, throw a descriptive error
  throw new Error(
    "No available generative model found. Check your Google Generative AI API access and model names."
  );
}

// Helper to run generateContent with model-fallback on 404 Not Found errors
// Also retries on transient 5xx errors with exponential backoff
async function generateWithFallback(prompt, retryCount = 0, maxRetries = 3) {
  console.log(">>>>>> [SERVER LOG] generateWithFallback called with prompt length:", prompt.length);
  
  // Ensure we have a model selected
  let modelInstance;
  try {
    console.log(">>>>>> [SERVER LOG] Attempting to choose model...");
    modelInstance = await chooseModel();
    console.log(">>>>>> [SERVER LOG] Model selected successfully:", cachedModelName);
  } catch (modelErr) {
    console.error(">>>>>> [SERVER ERROR] Failed to choose model:", modelErr.message || modelErr);
    throw modelErr;
  }

  try {
    console.log(">>>>>> [SERVER LOG] Calling generateContent on model:", cachedModelName);
    const response = await modelInstance.generateContent(prompt);
    console.log(">>>>>> [SERVER LOG] generateContent succeeded, got response");
    return response;
  } catch (err) {
    // If model not found for this API version, try next candidate (common 404 case)
    const status = err?.status || err?.response?.status;
    console.warn(">>>>>> [SERVER WARN] generateContent failed with status:", status, "Error:", err?.message || err);

    const message = (err?.message || "").toLowerCase();
    const isNetworkFailure =
      status == null &&
      (message.includes("fetch failed") ||
        message.includes("econnreset") ||
        message.includes("etimedout") ||
        message.includes("enotfound") ||
        message.includes("eai_again"));

    // Transient network failures: retry a few times and re-select model.
    if (isNetworkFailure && retryCount < maxRetries) {
      const delayMs = Math.pow(2, retryCount) * 1500; // 1.5s, 3s, 6s
      console.log(
        `>>>>>> [SERVER LOG] Network fetch failed. Retrying in ${Math.round(delayMs / 1000)}s (attempt ${retryCount + 1}/${maxRetries})...`
      );
      cachedModel = null;
      cachedModelName = null;
      await new Promise((resolve) => setTimeout(resolve, delayMs));
      return generateWithFallback(prompt, retryCount + 1, maxRetries);
    }

    // If rate-limited on the current model, immediately try the next candidate.
    // This is especially helpful on free tier where one model may be exhausted
    // while others still have headroom.
    if (status === 429) {
      console.log(">>>>>> [SERVER LOG] Rate limited (429). Attempting next available model...");

      const tried = new Set([cachedModelName]);
      cachedModel = null;
      cachedModelName = null;

      for (const name of CANDIDATE_MODELS) {
        if (tried.has(name)) continue;
        try {
          console.log(">>>>>> [SERVER LOG] Rate-limit fallback attempt with model:", name);
          const m = genAI.getGenerativeModel({ model: name });
          const resp = await m.generateContent(prompt);
          cachedModelName = name;
          cachedModel = m;
          console.log(">>>>>> [SERVER LOG] Rate-limit fallback successful with model:", name);
          return resp;
        } catch (innerErr) {
          const innerStatus = innerErr?.status || innerErr?.response?.status;
          console.warn(
            ">>>>>> [SERVER WARN] Rate-limit fallback model failed:",
            name,
            "status:",
            innerStatus,
            (innerErr && innerErr.message) || innerErr
          );
          // Keep trying next model (including if it also 429s)
        }
      }

      // If every model is rate limited/unavailable, surface the original error
      console.error(">>>>>> [SERVER ERROR] All models rate-limited/unavailable after 429.");
      throw err;
    }

    // Handle transient 5xx errors with exponential backoff
    if (status >= 500 && status < 600 && retryCount < maxRetries) {
      const delayMs = Math.pow(2, retryCount) * 1000; // 1s, 2s, 4s
      console.log(`>>>>>> [SERVER LOG] Got transient error ${status}, retrying in ${delayMs}ms (attempt ${retryCount + 1}/${maxRetries})...`);
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delayMs));
      
      // Retry with incremented count
      return generateWithFallback(prompt, retryCount + 1, maxRetries);
    }

    if (status === 404) {
      console.log(">>>>>> [SERVER LOG] Got 404, attempting fallback models...");
      // Invalidate cached model and try remaining candidates
      const tried = new Set([cachedModelName]);
      cachedModel = null;
      cachedModelName = null;

      for (const name of CANDIDATE_MODELS) {
        if (tried.has(name)) continue;
        try {
          console.log(">>>>>> [SERVER LOG] Fallback attempt with model:", name);
          const m = genAI.getGenerativeModel({ model: name });
          cachedModelName = name;
          cachedModel = m;
          console.log(">>>>>> [SERVER LOG] Falling back to model:", name);
          const fallbackResponse = await cachedModel.generateContent(prompt);
          console.log(">>>>>> [SERVER LOG] Fallback successful with model:", name);
          return fallbackResponse;
        } catch (innerErr) {
          console.warn(">>>>>> [SERVER WARN] fallback model failed:", name, (innerErr && innerErr.message) || innerErr);
        }
      }
    }

    // If we couldn't recover, rethrow the original error for higher-level handling
    console.error(">>>>>> [SERVER ERROR] All model attempts failed, rethrowing error:", err.message || err);
    throw err;
  }
}

export async function generateQuiz() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
    select: {
      industry: true,
      skills: true,
    },
  });

  if (!user) throw new Error("User not found");

  const prompt = `
    Generate 10 technical interview questions for a ${
      user.industry
    } professional${
    user.skills?.length ? ` with expertise in ${user.skills.join(", ")}` : ""
  }.
    
    Each question should be multiple choice with 4 options.
    
    Return the response in this JSON format only, no additional text:
    {
      "questions": [
        {
          "question": "string",
          "options": ["string", "string", "string", "string"],
          "correctAnswer": "string",
          "explanation": "string"
        }
      ]
    }
  `;

  try {
  const result = await generateWithFallback(prompt);
    const response = result.response;
    const text = response.text();
    const cleanedText = text.replace(/```(?:json)?\n?/g, "").trim();
    const quiz = JSON.parse(cleanedText);

    return quiz.questions;
  } catch (error) {
    console.error("Error generating quiz:", error);
    throw new Error("Failed to generate quiz questions");
  }
}

export async function saveQuizResult(questions, answers, score) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");

  const questionResults = questions.map((q, index) => ({
    question: q.question,
    answer: q.correctAnswer,
    userAnswer: answers[index],
    isCorrect: q.correctAnswer === answers[index],
    explanation: q.explanation,
  }));

  // Get wrong answers
  const wrongAnswers = questionResults.filter((q) => !q.isCorrect);

  // Only generate improvement tips if there are wrong answers
  let improvementTip = null;
  if (wrongAnswers.length > 0) {
    const wrongQuestionsText = wrongAnswers
      .map(
        (q) =>
          `Question: "${q.question}"\nCorrect Answer: "${q.answer}"\nUser Answer: "${q.userAnswer}"`
      )
      .join("\n\n");

    const improvementPrompt = `
      The user got the following ${user.industry} technical interview questions wrong:

      ${wrongQuestionsText}

      Based on these mistakes, provide a concise, specific improvement tip.
      Focus on the knowledge gaps revealed by these wrong answers.
      Keep the response under 2 sentences and make it encouraging.
      Don't explicitly mention the mistakes, instead focus on what to learn/practice.
    `;

    try {
  const tipResult = await generateWithFallback(improvementPrompt);

  improvementTip = tipResult.response.text().trim();
      console.log(improvementTip);
    } catch (error) {
      console.error("Error generating improvement tip:", error);
      // Continue without improvement tip if generation fails
    }
  }

  try {
    const assessment = await db.assessment.create({
      data: {
        userId: user.id,
        quizScore: score,
        questions: questionResults,
        category: "Technical",
        improvementTip,
      },
    });

    return assessment;
  } catch (error) {
    console.error("Error saving quiz result:", error);
    throw new Error("Failed to save quiz result");
  }
}

// ============ CUSTOM EXAM PERSISTENCE ============

// Create a ProctoredExam record for a custom exam configuration
export async function createCustomProctoredExam(examConfig) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");

  const totalQuestions =
    Object.values(examConfig.questionCounts || {}).reduce(
      (sum, val) => sum + (Number(val) || 0),
      0
    ) || 0;

  const examTitle =
    examConfig.title ||
    `Custom ${examConfig.industry || "General"} Exam (${totalQuestions} Qs)`;

  const passingScore = examConfig.passingScore ?? 60.0;

  const proctorStatus =
    examConfig.enableProctoring === false ? "disabled" : "enabled";

  try {
    const exam = await db.proctoredExam.create({
      data: {
        userId: user.id,
        examTitle,
        industry: examConfig.industry || "general",
        description:
          examConfig.description ||
          "Custom generated exam configured from JobGenie.",
        mcqCount: examConfig.questionCounts?.mcq || 0,
        codingCount: examConfig.questionCounts?.coding || 0,
        subjectiveCount: examConfig.questionCounts?.subjective || 0,
        fillBlankCount: examConfig.questionCounts?.fillBlank || 0,
        totalDuration: examConfig.duration || 60,
        passingScore,
        proctor: proctorStatus,
        status: "published",
      },
    });

    return exam;
  } catch (error) {
    console.error("Error creating custom proctored exam:", error);
    throw new Error("Failed to create custom exam");
  }
}

// Save a completed custom exam attempt into ExamAttempt table
export async function saveExamAttemptResult({ examId, startTime, endTime, config, results }) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");

  if (!examId) {
    throw new Error("Missing examId for exam attempt");
  }

  const {
    totalScore,
    percentageScore,
    questions,
    violations = [],
    timeSpent,
  } = results;

  const isPassing = (percentageScore || 0) >= (config?.passingScore ?? 60);

  // Normalize question/answer payload for storage
  const answersPayload = (questions || []).map((q) => ({
    questionId: q.questionId,
    questionText: q.questionText,
    questionType: q.questionType,
    userAnswer: q.userAnswer,
    correctAnswer: q.correctAnswer,
    isCorrect: q.isCorrect,
    explanation: q.explanation,
    solution: q.solution,
    reviewedByAI: q.reviewedByAI || false,
    reviewFeedback: q.reviewFeedback || null,
    score: q.score ?? null,
  }));

  try {
    const attempt = await db.examAttempt.create({
      data: {
        userId: user.id,
        examId,
        startTime: startTime ? new Date(startTime) : new Date(),
        endTime: endTime ? new Date(endTime) : new Date(),
        timeSpent: timeSpent ?? null,
        status: "completed",
        totalScore: totalScore ?? null,
        percentageScore: percentageScore ?? null,
        isPassing,
        answers: answersPayload,
        violations: violations || [],
        flaggedForReview: (violations || []).some(
          (v) => v.severity === "high" || v.type === "FULLSCREEN_EXIT"
        ),
        reviewNotes: null,
      },
    });

    return attempt;
  } catch (error) {
    console.error("Error saving exam attempt:", error);
    throw new Error("Failed to save exam attempt");
  }
}

// Fallback questions generator for when API fails
function generateFallbackQuestions(
  industry,
  difficulty,
  questionTypes,
  counts,
  preferredLanguage = "python",
  preferredSqlDialect = "postgresql"
) {
  console.log(">>>>>> [SERVER LOG] Generating fallback questions due to API failure");
  console.log(">>>>>> [SERVER LOG] Using preferred language:", preferredLanguage);
  
  // Helper function to get template for preferred language
  const getTemplateForLanguage = (templates, lang) => {
    return templates[lang] || templates.python || "// TODO: Implement solution";
  };
  
  const questionBank = {
    MCQ: [
      {
        id: 1,
        type: "MCQ",
        question: "What is the primary advantage of containerization?",
        options: ["Reduced memory usage", "Consistent deployment across environments", "Faster coding", "Lower hardware costs"],
        correctAnswer: "Consistent deployment across environments",
        explanation: "Containerization ensures applications run the same way regardless of where the container is deployed."
      },
      {
        id: 2,
        type: "MCQ",
        question: "Which of the following is NOT a principle of Agile?",
        options: ["Responding to change over following a plan", "Individuals and interactions over processes", "Following strict waterfall methodology", "Continuous delivery of valuable software"],
        correctAnswer: "Following strict waterfall methodology",
        explanation: "Agile explicitly values responding to change, not strictly following predetermined plans like in waterfall."
      },
      {
        id: 3,
        type: "MCQ",
        question: "What is the time complexity of accessing an element in an array by index?",
        options: ["O(n)", "O(log n)", "O(1)", "O(n²)"],
        correctAnswer: "O(1)",
        explanation: "Random access to array elements by index takes constant time, regardless of array size."
      },
      {
        id: 4,
        type: "MCQ",
        question: "Which HTTP status code indicates a successful request?",
        options: ["400", "404", "200", "500"],
        correctAnswer: "200",
        explanation: "HTTP 200 OK indicates that the request succeeded and the response body contains the requested data."
      },
    ],
    CODING: [
      {
        id: 5,
        type: "CODING",
        question: "Given a string `s`, find the length of the longest substring without repeating characters.\n\nExample:\nInput: \"abcabcbb\"\nOutput: 3\nExplanation: The answer is \"abc\", with the length of 3.",
        templates: {
          python: "def lengthOfLongestSubstring(s):\n    # TODO: Implement the sliding window approach\n    # Use a dictionary to track character positions\n    # Return the maximum length found\n    pass",
          javascript: "function lengthOfLongestSubstring(s) {\n    // TODO: Implement the sliding window approach\n    // Use a Map to track character positions\n    // Return the maximum length found\n}",
          java: "public class Solution {\n    public int lengthOfLongestSubstring(String s) {\n        // TODO: Implement the sliding window approach\n        // Use HashMap for character tracking\n        // Return max length\n    }\n}",
          cpp: "#include <iostream>\n#include <unordered_map>\nusing namespace std;\n\nint lengthOfLongestSubstring(string s) {\n    // TODO: Implement the sliding window approach\n    // Use unordered_map for character positions\n    // Return max length\n}",
          csharp: "public class Solution {\n    public int LengthOfLongestSubstring(string s) {\n        // TODO: Implement the sliding window approach\n        // Use Dictionary for character tracking\n        // Return max length\n    }\n}",
          go: "func LengthOfLongestSubstring(s string) int {\n    // TODO: Implement the sliding window approach\n    // Use map for character positions\n    // Return max length\n}",
          rust: "impl Solution {\n    pub fn length_of_longest_substring(s: String) -> i32 {\n        // TODO: Implement the sliding window approach\n        // Use HashMap for character tracking\n        // Return max length\n    }\n}",
          typescript: "function lengthOfLongestSubstring(s: string): number {\n    // TODO: Implement the sliding window approach\n    // Use Map for character positions\n    // Return max length\n}"
        },
        language: preferredLanguage,
        sampleInput: "\"abcabcbb\"",
        sampleOutput: "3",
        testCases: [
          { input: "abcabcbb", expectedOutput: "3" },
          { input: "bbbbb", expectedOutput: "1" },
          { input: "pwwkew", expectedOutput: "3" },
          { input: "au", expectedOutput: "2" },
          { input: "", expectedOutput: "0" },
        ],
        explanation: "Use a sliding window with a hash map to track character indices. Whenever you encounter a repeating character, move the start pointer to skip the previous occurrence."
      },
      {
        id: 6,
        type: "CODING",
        question: "Given an array of integers `nums` and an integer `target`, return the indices of the two numbers that add up to the target.\n\nExample:\nInput: nums = [2,7,11,15], target = 9\nOutput: [0,1]\nExplanation: nums[0] + nums[1] = 2 + 7 = 9",
        templates: {
          python: "def twoSum(nums, target):\n    # TODO: Use a hash map to track seen numbers\n    # For each number, check if (target - number) exists\n    # Return indices of the two numbers\n    pass",
          javascript: "function twoSum(nums, target) {\n    // TODO: Use a Map to track seen numbers\n    // For each number, check if (target - number) exists\n    // Return indices of the two numbers\n}",
          java: "public class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        // TODO: Use HashMap for tracking numbers\n        // For each number, check if complement exists\n        // Return indices array\n    }\n}",
          cpp: "#include <iostream>\n#include <unordered_map>\n#include <vector>\nusing namespace std;\n\nvector<int> twoSum(vector<int>& nums, int target) {\n    // TODO: Use unordered_map for tracking\n    // For each number, check if complement exists\n    // Return indices vector\n}",
          csharp: "public class Solution {\n    public int[] TwoSum(int[] nums, int target) {\n        // TODO: Use Dictionary for tracking numbers\n        // For each number, check if complement exists\n        // Return indices array\n    }\n}",
          go: "func TwoSum(nums []int, target int) []int {\n    // TODO: Use map for tracking numbers\n    // For each number, check if complement exists\n    // Return indices slice\n}",
          rust: "impl Solution {\n    pub fn two_sum(nums: Vec<i32>, target: i32) -> Vec<i32> {\n        // TODO: Use HashMap for tracking\n        // For each number, check if complement exists\n        // Return indices vector\n    }\n}",
          typescript: "function twoSum(nums: number[], target: number): number[] {\n    // TODO: Use Map for tracking numbers\n    // For each number, check if complement exists\n    // Return indices array\n}"
        },
        language: preferredLanguage,
        sampleInput: "[2,7,11,15], 9",
        sampleOutput: "[0,1]",
        testCases: [
          { input: "2 7 11 15 9", expectedOutput: "0 1" },
          { input: "3 2 4 6", expectedOutput: "1 2" },
          { input: "3 3 6", expectedOutput: "0 1" },
        ],
        explanation: "Use a hash map to store numbers you've seen. For each number, check if (target - number) exists in the hash map. Time complexity: O(n), Space: O(n)"
      },
      {
        id: 7,
        type: "CODING",
        question: "Given a string `s` containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.\n\nExample:\nInput: \"()\"\nOutput: true\nInput: \"([)]\" \nOutput: false",
        templates: {
          python: "def isValid(s):\n    # TODO: Use a stack to match brackets\n    # Push opening brackets onto stack\n    # For closing brackets, check if matching opening bracket is at top\n    pass",
          javascript: "function isValid(s) {\n    // TODO: Use a stack to match brackets\n    // Push opening brackets onto stack\n    // For closing brackets, check if matching opening bracket is at top\n}",
          java: "public class Solution {\n    public boolean isValid(String s) {\n        // TODO: Use Stack for bracket matching\n        // Push opening brackets onto stack\n        // For closing brackets, check top of stack\n    }\n}",
          cpp: "#include <iostream>\n#include <stack>\nusing namespace std;\n\nbool isValid(string s) {\n    // TODO: Use stack for bracket matching\n    // Push opening brackets\n    // For closing brackets, check top of stack\n}",
          csharp: "public class Solution {\n    public bool IsValid(string s) {\n        // TODO: Use Stack for bracket matching\n        // Push opening brackets\n        // For closing brackets, check top of stack\n    }\n}",
          go: "func IsValid(s string) bool {\n    // TODO: Use slice as stack for bracket matching\n    // Push opening brackets\n    // For closing brackets, check top of stack\n}",
          rust: "impl Solution {\n    pub fn is_valid(s: String) -> bool {\n        // TODO: Use Vec as stack for bracket matching\n        // Push opening brackets\n        // For closing brackets, check top of stack\n    }\n}",
          typescript: "function isValid(s: string): boolean {\n    // TODO: Use array as stack for bracket matching\n    // Push opening brackets\n    // For closing brackets, check top of stack\n}"
        },
        language: preferredLanguage,
        sampleInput: "\"()\"",
        sampleOutput: "True",
        testCases: [
          { input: "()", expectedOutput: "True" },
          { input: "()[]{}", expectedOutput: "True" },
          { input: "([)]", expectedOutput: "False" },
          { input: "{[]}", expectedOutput: "True" },
          { input: "([{}])", expectedOutput: "True" },
        ],
        explanation: "Use a stack to match opening and closing brackets. Push opening brackets onto the stack, and when you encounter a closing bracket, check if it matches the top of the stack."
      },
    ],
    SQL: [
      {
        id: 11,
        type: "SQL",
        question:
          "Given a table `employees(id, name, department_id, salary)` and `departments(id, name)`, write a query to return each department name and the average salary of employees in that department, ordered by average salary descending.",
        sqlDialect: preferredSqlDialect,
        template: "-- TODO: Write your SQL query here\n",
        sampleInput:
          "employees: (1,A,10,50000), (2,B,10,70000), (3,C,20,60000)\ndepartments: (10,Engineering), (20,Design)",
        sampleOutput:
          "Engineering | 60000\nDesign | 60000",
        explanation:
          "Use JOIN + GROUP BY department and aggregate with AVG(salary), then sort descending by average salary.",
      },
      {
        id: 12,
        type: "SQL",
        question:
          "Write a query to find customers who placed at least 3 orders in the last 30 days. Tables: `customers(id, name)` and `orders(id, customer_id, order_date)`.",
        sqlDialect: preferredSqlDialect,
        template: "-- TODO: Write your SQL query here\n",
        sampleInput:
          "customers + orders with different order counts in last 30 days",
        sampleOutput:
          "Only customers with 3 or more recent orders",
        explanation:
          "Use date filtering, GROUP BY customer, and HAVING COUNT(*) >= 3.",
      },
    ],
    SUBJECTIVE: [
      {
        id: 7,
        type: "SUBJECTIVE",
        question: "Explain the difference between SQL and NoSQL databases.",
        explanation: "A good answer should cover: SQL uses structured schemas with tables/rows, ACID compliance. NoSQL uses flexible schemas, horizontal scalability, eventual consistency. Include use case examples."
      },
      {
        id: 8,
        type: "SUBJECTIVE",
        question: "What is the significance of CI/CD in modern software development?",
        explanation: "A good answer should mention: Continuous Integration (merging code frequently), Continuous Deployment (automated releases), benefits like faster feedback, reduced bugs, and automated testing."
      },
    ],
    FILL_BLANK: [
      {
        id: 9,
        type: "FILL_BLANK",
        question: "The process of converting source code into machine code is called ________.",
        correctAnswer: "compilation",
        explanation: "Compilation is the process where a compiler translates human-readable source code into executable machine code."
      },
      {
        id: 10,
        type: "FILL_BLANK",
        question: "In RESTful APIs, ________ is a request method used to retrieve data without modifying it.",
        correctAnswer: "GET",
        explanation: "GET is the HTTP method used to request data from a server in a safe and idempotent manner."
      },
    ]
  };

  const selectedQuestions = [];
  let questionId = 1;

  if (questionTypes.mcq && counts.mcq > 0) {
    const mcqs = questionBank.MCQ.slice(0, counts.mcq);
    selectedQuestions.push(...mcqs.map((q, idx) => ({ ...q, id: questionId++, isFallback: true })));
  }
  if (questionTypes.coding && counts.coding > 0) {
    const codings = questionBank.CODING.slice(0, counts.coding);
    selectedQuestions.push(...codings.map((q, idx) => ({ 
      ...q, 
      id: questionId++, 
      isFallback: true,
      language: preferredLanguage
    })));
  }
  if (questionTypes.subjective && counts.subjective > 0) {
    const subj = questionBank.SUBJECTIVE.slice(0, counts.subjective);
    selectedQuestions.push(...subj.map((q, idx) => ({ ...q, id: questionId++, isFallback: true })));
  }
  if (questionTypes.sql && counts.sql > 0) {
    const sqlQs = questionBank.SQL.slice(0, counts.sql);
    selectedQuestions.push(
      ...sqlQs.map((q) => ({
        ...q,
        id: questionId++,
        isFallback: true,
        sqlDialect: preferredSqlDialect,
      }))
    );
  }
  if (questionTypes.fillBlank && counts.fillBlank > 0) {
    const fill = questionBank.FILL_BLANK.slice(0, counts.fillBlank);
    selectedQuestions.push(...fill.map((q, idx) => ({ ...q, id: questionId++, isFallback: true })));
  }

  console.log(">>>>>> [SERVER LOG] Generated", selectedQuestions.length, "fallback questions");
  return selectedQuestions;
}

// New function to generate custom exam questions
export async function generateCustomExamQuestions(
  industry,
  difficulty,
  questionTypes,
  counts,
  preferredLanguage = "python",
  preferredSqlDialect = "postgresql"
) {
  // Log immediately at the start
  console.log("\n========== EXAM QUESTION GENERATION START ==========");
  console.log("Industry:", industry);
  console.log("Difficulty:", difficulty);
  console.log("Question Types:", questionTypes);
  console.log("Counts:", counts);
  console.log("Preferred Language:", preferredLanguage);
  console.log("Preferred SQL Dialect:", preferredSqlDialect);
  console.log("=====================================================\n");
  
  const industryLabels = {
    "tech-software": "Software Development",
    "tech-web": "Web Development",
    "tech-data": "Data Science",
    "tech-devops": "DevOps",
    "tech-ai": "AI/Machine Learning",
    "tech-mobile": "Mobile Development",
    "tech-cloud": "Cloud Computing",
    "finance-banking": "Banking & Finance",
    "finance-accounting": "Accounting",
    "finance-investment": "Investment & Trading",
    "marketing": "Marketing & Strategy",
    "sales": "Sales Development",
    "product": "Product Management",
    "hr": "Human Resources",
    "management": "Management & Leadership",
    "design": "UX/UI Design",
    "legal": "Legal & Compliance",
  };

  const industryLabel = industryLabels[industry] || industry;

  const prompt = `
    Generate interview questions for a ${industryLabel} professional at ${difficulty} difficulty level.
    
    Generate the following types and counts of questions:
    ${questionTypes.mcq ? `- ${counts.mcq} Multiple Choice Questions (MCQ)` : ""}
    ${questionTypes.coding ? `- ${counts.coding} Coding/Problem Solving Questions` : ""}
    ${questionTypes.sql ? `- ${counts.sql} SQL Questions` : ""}
    ${questionTypes.subjective ? `- ${counts.subjective} Subjective/Essay Questions` : ""}
    ${questionTypes.fillBlank ? `- ${counts.fillBlank} Fill in the Blanks Questions` : ""}

    For MCQ: Provide 4 options each (a, b, c, d format for options array)
    For Coding: 
      - Provide a clear problem statement
      - Include starter code in ONLY ${preferredLanguage} language (provide TODO-style skeleton, NOT full solution)
      - CRITICAL: Use ONLY language-appropriate comments:
        * Python: Use # for comments NEVER use //
        * Java/C++/JavaScript/TypeScript/Go/Rust/C#: Use // for single-line comments NEVER use #
      - Include 3-5 test cases with input and expectedOutput fields
      - Include sampleInput and sampleOutput as example strings
      - Make problems based on real interview scenarios (LeetCode-style preferred)
    For Subjective: Provide detailed explanation of what would be a good answer
    For SQL:
      - Provide practical SQL interview tasks
      - Use ${preferredSqlDialect} dialect
      - Return starter query in "template"
      - Include sampleInput and sampleOutput
      - Include explanation of query approach
    For Fill Blanks: Single word or short phrase blanks
    
    Ensure questions are relevant to the ${industryLabel} field and match the ${difficulty} difficulty level.
    
    Return response in this JSON format ONLY:
    {
      "questions": [
        {
          "id": number,
          "type": "MCQ" | "CODING" | "SQL" | "SUBJECTIVE" | "FILL_BLANK",
          "question": "string",
          "options": ["string", "string", "string", "string"] (for MCQ only),
          "correctAnswer": "string" (for MCQ and FILL_BLANK),
          "template": "string" (for CODING, skeleton code only in ${preferredLanguage}, not full solution),
          "sqlDialect": "${preferredSqlDialect}" (for SQL),
          "testCases": [{"input": "...", "expectedOutput": "..."}, ...] (for CODING, minimum 3 test cases),
          "sampleInput": "string" (for CODING, example input as string),
          "sampleOutput": "string" (for CODING, example output as string),
          "explanation": "string"
        }
      ]
    }
  `;

  try {
    console.log("[AI Generation] Attempting to generate questions using AI API...");
    const result = await generateWithFallback(prompt);
    console.log("[AI Generation] Got response from AI API");
    
    const text = result.response.text();
    console.log("[AI Generation] Response text length:", text.length);
    
    const parsed = parseJsonLenient(text);
    
    if (!parsed.questions || parsed.questions.length === 0) {
      console.warn("[AI Generation] API returned empty questions, using fallback");
      return generateFallbackQuestions(
        industry,
        difficulty,
        questionTypes,
        counts,
        preferredLanguage,
        preferredSqlDialect
      );
    }
    
    // Normalize AI-generated questions to ensure coding questions have templates object
    const normalizedQuestions = parsed.questions.map(q => {
      if (q.type === "CODING" && q.template) {
        // Convert single template to templates object
        return {
          ...q,
          templates: q.templates || { [preferredLanguage]: q.template },
          language: preferredLanguage
        };
      }
      if (q.type === "SQL") {
        return {
          ...q,
          // Never prefill solved SQL. Force a starter stub.
          template: "-- TODO: Write your SQL query here\n",
          sqlDialect: q.sqlDialect || preferredSqlDialect,
        };
      }
      return q;
    });
    
    console.log("[AI Generation] Successfully generated", normalizedQuestions.length, "questions from AI");
    return normalizedQuestions;
  } catch (error) {
    const status = error?.status || error?.response?.status;
    const errorMessage = error?.message || String(error);
    
    if (status >= 500) {
      console.warn(`[AI Generation] API service error (${status}): ${errorMessage}`);
      console.warn("[AI Generation] Google Generative AI service is temporarily unavailable. Using fallback questions.");
    } else {
      console.warn("[AI Generation] AI generation failed:", errorMessage);
    }
    
    // Return fallback questions instead of throwing error
    console.log("[AI Generation] Falling back to pre-made questions");
    return generateFallbackQuestions(
      industry,
      difficulty,
      questionTypes,
      counts,
      preferredLanguage,
      preferredSqlDialect
    );
  }
}

// New function to review subjective and coding answers using AI
export async function reviewSubjectiveAnswers(questions) {
  console.log("\n========== SUBJECTIVE ANSWER REVIEW START ==========");
  console.log("Reviewing", questions.length, "questions");
  
  const reviewedQuestions = [];
  
  for (const question of questions) {
    if (
      question.questionType === "SUBJECTIVE" ||
      question.questionType === "CODING" ||
      question.questionType === "SQL"
    ) {
      console.log(`[Review] Reviewing ${question.questionType} question:`, question.questionId);

      const isCoding = question.questionType === "CODING" || question.questionType === "SQL";
      const reviewPrompt = isCoding
        ? `You are an expert coding interviewer.
Review the coding solution and evaluate correctness, completeness, and quality.

Question:
${question.questionText}

Expected/Good Answer Criteria:
${question.explanation || "Correct logic, edge-case handling, and clear implementation."}

Student's Answer:
${question.userAnswer || "(no answer provided)"}

Respond ONLY with valid JSON in this exact format:
{
  "isCorrect": true or false,
  "score": 0-100,
  "feedback": "Brief feedback about the answer",
  "modelSolution": "A correct code solution only (no markdown fences, no prose)"
}`
        : `You are an expert interviewer. Review the following subjective answer and determine if it is correct.

Question: ${question.questionText}

Expected/Good Answer Criteria: ${question.explanation || "A comprehensive answer demonstrating understanding of the topic"}

Student's Answer: "${question.userAnswer || "(no answer provided)"}"

Respond ONLY with valid JSON in this exact format:
{
  "isCorrect": true or false,
  "score": 0-100,
  "feedback": "Brief feedback about the answer"
}`;

      try {
        const result = await generateWithFallback(reviewPrompt);
        const text = result.response.text();

        const review = parseJsonLenient(text);
        
        console.log(`[Review] Question ${question.questionId} marked as:`, review.isCorrect ? "CORRECT" : "INCORRECT");
        
        reviewedQuestions.push({
          ...question,
          isCorrect: review.isCorrect,
          score: review.score || (review.isCorrect ? 100 : 0),
          reviewFeedback: review.feedback || "",
          // For coding questions, surface AI-generated code solution on report page.
          solution:
            isCoding && typeof review.modelSolution === "string" && review.modelSolution.trim()
              ? review.modelSolution.trim()
              : question.solution || "",
          reviewedByAI: true,
        });
      } catch (error) {
        console.warn(`[Review] Failed to review question ${question.questionId}, marking as incorrect`);
        reviewedQuestions.push({
          ...question,
          isCorrect: false,
          score: 0,
          reviewFeedback: "Unable to review - please try again",
          reviewedByAI: false,
        });
      }
    } else {
      // Keep MCQ and FILL_BLANK questions as-is (already marked correct/incorrect)
      reviewedQuestions.push(question);
    }
  }
  
  console.log("[Review] Completed reviewing all subjective/coding answers");
  console.log("=====================================================\n");
  return reviewedQuestions;
}

// Function to fetch user's assessments
export async function getAssessments() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");

  try {
    // Mock quiz assessments
    const quizAssessments = await db.assessment.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    // Custom exam attempts (completed only)
    const examAttempts = await db.examAttempt.findMany({
      where: {
        userId: user.id,
        status: "completed",
      },
      orderBy: {
        createdAt: "asc",
      },
      include: {
        proctoredExam: true,
      },
    });

    // Normalize into a single collection used by UI
    const normalizedQuizAssessments = quizAssessments.map((a) => ({
      ...a,
      source: "quiz",
    }));

    const normalizedExamAssessments = examAttempts.map((attempt) => {
      const questions = (attempt.answers || []).map((q) => ({
        question: q.questionText,
        answer: q.correctAnswer,
        userAnswer: q.userAnswer,
        isCorrect: q.isCorrect,
        explanation: q.explanation || "",
      }));

      return {
        id: attempt.id,
        createdAt: attempt.createdAt,
        quizScore: attempt.percentageScore ?? 0,
        questions,
        category: "Custom Exam",
        improvementTip: null,
        source: "exam",
        examTitle: attempt.proctoredExam?.examTitle || "Custom Exam",
      };
    });

    // Merge and sort by createdAt descending so newest appears first
    const combined = [...normalizedQuizAssessments, ...normalizedExamAssessments].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );

    return combined;
  } catch (error) {
    console.error("Error fetching assessments:", error);
    throw new Error("Failed to fetch assessments");
  }
}