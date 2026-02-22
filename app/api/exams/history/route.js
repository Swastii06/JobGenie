import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user from database using clerk ID
    const user = await prisma.user.findUnique({
      where: { clerkUserId: userId },
      include: {
        examAttempts: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      attempts: user.examAttempts,
      totalAttempts: user.examAttempts.length,
      averageScore: 
        user.examAttempts.length > 0
          ? (
              user.examAttempts.reduce((sum, a) => sum + (a.totalScore || 0), 0) /
              user.examAttempts.length
            ).toFixed(2)
          : 0,
    });
  } catch (error) {
    console.error("Error fetching exam history:", error);
    return NextResponse.json(
      { error: "Failed to fetch exam history" },
      { status: 500 }
    );
  }
}
