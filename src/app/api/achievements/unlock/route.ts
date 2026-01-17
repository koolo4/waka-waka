import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/achievements/unlock
 * Unlock an achievement for a user
 */

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, achievementId } = body;

    if (!userId || !achievementId) {
      return NextResponse.json(
        { error: "Missing userId or achievementId" },
        { status: 400 }
      );
    }

    // Check if achievement already unlocked
    const existing = await prisma.userAchievement.findUnique({
      where: {
        userId_achievementId: {
          userId,
          achievementId,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { message: "Achievement already unlocked", achievement: existing },
        { status: 200 }
      );
    }

    // Unlock achievement
    const userAchievement = await prisma.userAchievement.create({
      data: {
        userId,
        achievementId,
      },
      include: {
        achievement: true,
      },
    });

    return NextResponse.json(userAchievement, { status: 201 });
  } catch (error) {
    console.error("Failed to unlock achievement:", error);
    return NextResponse.json(
      { error: "Failed to unlock achievement" },
      { status: 500 }
    );
  }
}
