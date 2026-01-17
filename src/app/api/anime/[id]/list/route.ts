import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: animeId } = await params;
  const animeIdNum = parseInt(animeId, 10);
  const body = await req.json();

  const user = await prisma.user.findUnique({
    where: { email: session.user.email }
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const anime = await prisma.anime.findUnique({
    where: { id: animeIdNum }
  });

  if (!anime) {
    return NextResponse.json({ error: "Anime not found" }, { status: 404 });
  }

  const userAnimeStatus = await prisma.userAnimeStatus.create({
    data: {
      userId: user.id,
      animeId: animeIdNum,
      status: body.status || "WATCH_LATER",
      currentEpisode: 0,
      totalEpisodes: 0,
      watchPercentage: 0,
      isFavorite: false
    },
    include: { anime: true }
  });

  return NextResponse.json(userAnimeStatus, { status: 201 });
}
