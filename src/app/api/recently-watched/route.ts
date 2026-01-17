import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/recently-watched?userId=X - Get user's recently watched anime
 * POST /api/recently-watched - Add or update recently watched
 */

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const userId = searchParams.get("userId");
    const limit = searchParams.get("limit") || "10";

    if (!userId) {
      return NextResponse.json(
        { error: "Missing userId parameter" },
        { status: 400 }
      );
    }

    const recentlyWatched = await prisma.recentlyWatched.findMany({
      where: { userId: parseInt(userId) },
      include: {
        anime: {
          select: {
            id: true,
            title: true,
            imageUrl: true,
            genre: true,
            year: true,
            studio: true,
          },
        },
      },
      orderBy: { lastWatchedAt: "desc" },
      take: parseInt(limit),
    });

    return NextResponse.json(recentlyWatched);
  } catch (error) {
    console.error("Failed to fetch recently watched:", error);
    return NextResponse.json(
      { error: "Failed to fetch recently watched" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, animeId, progress } = body;

    if (!userId || !animeId) {
      return NextResponse.json(
        { error: "Missing userId or animeId" },
        { status: 400 }
      );
    }

    // Upsert recently watched entry
    const recentlyWatched = await prisma.recentlyWatched.upsert({
      where: {
        userId_animeId: {
          userId,
          animeId,
        },
      },
      update: {
        lastWatchedAt: new Date(),
        progress: progress || undefined,
      },
      create: {
        userId,
        animeId,
        progress: progress || 0,
      },
      include: {
        anime: {
          select: {
            id: true,
            title: true,
            imageUrl: true,
            genre: true,
            year: true,
            studio: true,
          },
        },
      },
    });

    return NextResponse.json(recentlyWatched, { status: 200 });
  } catch (error) {
    console.error("Failed to update recently watched:", error);
    return NextResponse.json(
      { error: "Failed to update recently watched" },
      { status: 500 }
    );
  }
}
