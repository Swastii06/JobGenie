import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const industry = searchParams.get("industry");
    const type = searchParams.get("type");
    const difficulty = searchParams.get("difficulty") || "medium";
    const count = parseInt(searchParams.get("count")) || 10;

    if (!industry || !type) {
      return NextResponse.json(
        { error: "Industry and type parameters are required" },
        { status: 400 }
      );
    }

    // Get questions from database
    const questions = await db.question.findMany({
      where: {
        industry: industry,
        questionType: type,
        difficulty: difficulty,
      },
      take: count,
    });

    // If not enough questions in database, return mock data
    if (questions.length === 0) {
      return NextResponse.json({
        success: true,
        questions: generateMockQuestions(type, count, industry),
        isMock: true,
      });
    }

    return NextResponse.json({
      success: true,
      questions: questions,
      isMock: false,
    });
  } catch (error) {
    console.error("Error fetching questions:", error);
    return NextResponse.json(
      { error: "Failed to fetch questions" },
      { status: 500 }
    );
  }
}

function generateMockQuestions(type, count, industry) {
  const mockQuestions = {
    MCQ: [
      {
        id: `mcq-${Date.now()}-1`,
        questionText: "What is the time complexity of binary search?",
        questionType: "MCQ",
        options: ["O(n)", "O(log n)", "O(n²)", "O(2^n)"],
        correctAnswer: "O(log n)",
        industry: industry,
      },
      {
        id: `mcq-${Date.now()}-2`,
        questionText: "Which data structure uses LIFO?",
        questionType: "MCQ",
        options: ["Queue", "Stack", "Tree", "Graph"],
        correctAnswer: "Stack",
        industry: industry,
      },
    ],
    CODING: [
      {
        id: `coding-${Date.now()}-1`,
        questionText: "Write a function to check if a number is prime.",
        questionType: "CODING",
        codeTemplate: "def is_prime(n):\n    pass",
        language: "python",
        industry: industry,
      },
    ],
    SUBJECTIVE: [
      {
        id: `subj-${Date.now()}-1`,
        questionText: "Explain the concept of polymorphism in OOP.",
        questionType: "SUBJECTIVE",
        industry: industry,
      },
    ],
    FILL_BLANK: [
      {
        id: `fill-${Date.now()}-1`,
        questionText: "The process of converting source code into machine code is called ________.",
        questionType: "FILL_BLANK",
        correctAnswer: "compilation",
        industry: industry,
      },
    ],
  };

  return (mockQuestions[type] || []).slice(0, count);
}
