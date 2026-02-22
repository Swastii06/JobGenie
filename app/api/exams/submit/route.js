import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      examTitle,
      industry,
      questionCounts,
      answers,
      totalScore,
      percentageScore,
      correctAnswers,
      totalQuestions,
      timeSpent,
      proctor,
    } = body;

    // Get user from database using clerk ID
    const user = await prisma.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Create exam attempt record
    const examAttempt = await prisma.examAttempt.create({
      data: {
        userId: user.id,
        examId: "", // Will be updated if we have predefined exams
        startTime: new Date(Date.now() - timeSpent * 1000),
        endTime: new Date(),
        timeSpent: timeSpent,
        status: "completed",
        totalScore: totalScore,
        percentageScore: percentageScore,
        isPassing: percentageScore >= 60,
        answers: Object.entries(answers).map(([questionId, answer]) => ({
          questionId,
          userAnswer: answer,
        })),
        violations: [], // Will be populated if proctoring is enabled
      },
    });

    return NextResponse.json({
      success: true,
      message: "Exam submitted successfully",
      attemptId: examAttempt.id,
      score: totalScore,
      percentageScore: percentageScore,
      isPassing: percentageScore >= 60,
    });
  } catch (error) {
    console.error("Error submitting exam:", error);
    return NextResponse.json(
      { error: "Failed to submit exam" },
      { status: 500 }
    );
  }
}
