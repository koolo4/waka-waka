import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/achievements - Get all achievements
 * POST /api/achievements - Create a new achievement (admin only)
 */

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const userId = searchParams.get("userId");

    if (userId) {
      // Get achievements for a specific user
      const userAchievements = await prisma.userAchievement.findMany({
        where: { userId: parseInt(userId) },
        include: {
          achievement: true,
        },
        orderBy: { unlockedAt: "desc" },
      });

      return NextResponse.json(userAchievements);
    }

    // Get all achievements
    const achievements = await prisma.achievement.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(achievements);
  } catch (error) {
    console.error("Failed to fetch achievements:", error);
    return NextResponse.json(
      { error: "Failed to fetch achievements" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, description, icon, badge, condition, rarity } = body;

    if (!name || !description || !icon || !condition) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const achievement = await prisma.achievement.create({
      data: {
        name,
        description,
        icon,
        badge: badge || null,
        condition,
        rarity: rarity || "common",
      },
    });

    return NextResponse.json(achievement, { status: 201 });
  } catch (error) {
    console.error("Failed to create achievement:", error);
    return NextResponse.json(
      { error: "Failed to create achievement" },
      { status: 500 }
    );
  }
}
