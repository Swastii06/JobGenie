"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

console.log(">>>>>> [SERVER LOG] Checking API Key:", process.env.GEMINI_API_KEY);

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Resilient model selection: try a list of candidate models and cache the first
// available one. If the chosen model later returns a 404 (not supported for
// generateContent), we'll attempt the next candidate. This avoids hard failures
// when model names or API versions change.
const CANDIDATE_MODELS = [
  // Preferred Gemini candidates (try more recent first)
  "gemini-2.5-flash",
  "gemini-1.5",
  "gemini-2.5-pro",
  "gemini-2.0",
  // Fallback to text-bison (older text model) if Gemini variants are not available
  "text-bison-001",
  "text-bison",
];

let cachedModelName = null;
let cachedModel = null;

async function chooseModel() {
  if (cachedModel) return cachedModel;

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

  for (const name of CANDIDATE_MODELS) {
    try {
      const m = genAI.getGenerativeModel({ model: name });
      // Test a no-op call if the SDK provides a quick validation method. If not,
      // we optimistically select the model and handle errors on generate.
      cachedModelName = name;
      cachedModel = m;
      console.log(">>>>>> [SERVER LOG] Selected generative model:", name);
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
async function generateWithFallback(prompt) {
  // Ensure we have a model selected
  let modelInstance = await chooseModel();

  try {
    return await modelInstance.generateContent(prompt);
  } catch (err) {
    // If model not found for this API version, try next candidate (common 404 case)
    const status = err?.status || err?.response?.status;
    console.warn(">>>>>> [SERVER WARN] generateContent failed:", err?.message || err, "status:", status);

    if (status === 404) {
      // Invalidate cached model and try remaining candidates
      const tried = new Set([cachedModelName]);
      cachedModel = null;

      for (const name of CANDIDATE_MODELS) {
        if (tried.has(name)) continue;
        try {
          const m = genAI.getGenerativeModel({ model: name });
          cachedModelName = name;
          cachedModel = m;
          console.log(">>>>>> [SERVER LOG] Falling back to model:", name);
          return await cachedModel.generateContent(prompt);
        } catch (innerErr) {
          console.warn(">>>>>> [SERVER WARN] fallback model failed:", name, (innerErr && innerErr.message) || innerErr);
        }
      }
    }

    // If we couldn't recover, rethrow the original error for higher-level handling
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

export async function getAssessments() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");

  try {
    const assessments = await db.assessment.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    return assessments;
  } catch (error) {
    console.error("Error fetching assessments:", error);
    throw new Error("Failed to fetch assessments");
  }
}