import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/streak?userId=X - Get user's activity streak
 * POST /api/streak - Update activity streak
 */

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "Missing userId parameter" },
        { status: 400 }
      );
    }

    const streak = await prisma.activityStreak.findUnique({
      where: { userId: parseInt(userId) },
    });

    if (!streak) {
      // Create new streak if doesn't exist
      const newStreak = await prisma.activityStreak.create({
        data: { userId: parseInt(userId) },
      });
      return NextResponse.json(newStreak);
    }

    return NextResponse.json(streak);
  } catch (error) {
    console.error("Failed to fetch streak:", error);
    return NextResponse.json(
      { error: "Failed to fetch streak" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId: rawUserId } = body;

    if (!rawUserId) {
      return NextResponse.json(
        { error: "Missing userId" },
        { status: 400 }
      );
    }

    const userId = typeof rawUserId === "string" ? parseInt(rawUserId) : rawUserId;

    // Get current streak
    let streak = await prisma.activityStreak.findUnique({
      where: { userId },
    });

    if (!streak) {
      streak = await prisma.activityStreak.create({
        data: { userId },
      });
    }

    // Check if activity is today
    const lastActivity = new Date(streak.lastActivityAt);
    const today = new Date();
    const isToday =
      lastActivity.toDateString() === today.toDateString();

    let newCurrentStreak = streak.currentStreak;

    if (!isToday) {
      // Check if it was yesterday
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const isYesterday =
        lastActivity.toDateString() === yesterday.toDateString();

      if (isYesterday) {
        // Continue streak
        newCurrentStreak = streak.currentStreak + 1;
      } else {
        // Break streak
        newCurrentStreak = 1;
      }
    }

    // Update streak
    const updated = await prisma.activityStreak.update({
      where: { userId },
      data: {
        currentStreak: newCurrentStreak,
        maxStreak: Math.max(newCurrentStreak, streak.maxStreak),
        lastActivityAt: new Date(),
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Failed to update streak:", error);
    return NextResponse.json(
      { error: "Failed to update streak" },
      { status: 500 }
    );
  }
}
