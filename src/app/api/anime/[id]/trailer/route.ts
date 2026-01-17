import { NextRequest, NextResponse } from 'next/server';

// YouTube Data API v3 does NOT require authentication for search (unless quota is high)
// But we'll use a simple approach: search YouTube and extract video ID

async function searchYouTubeTrailer(
  animeTitle: string,
  malId?: number
): Promise<string | null> {
  try {
    // Try to use YouTube Data API if we have a key
    const apiKey = process.env.YOUTUBE_API_KEY;
    
    if (!apiKey) {
      // Fallback: construct a search query
      const searchQuery = `${animeTitle} opening`;
      // Return null - client-side YouTube search would be better
      return null;
    }

    const searchQuery = `${animeTitle} trailer`;
    const url = new URL('https://www.googleapis.com/youtube/v3/search');
    url.searchParams.append('q', searchQuery);
    url.searchParams.append('part', 'snippet');
    url.searchParams.append('type', 'video');
    url.searchParams.append('maxResults', '1');
    url.searchParams.append('key', apiKey);
    url.searchParams.append('order', 'relevance');

    const response = await fetch(url.toString());
    if (!response.ok) {
      console.error('YouTube API error:', response.statusText);
      return null;
    }

    const data = await response.json();
    const videoId = data.items?.[0]?.id?.videoId;
    
    return videoId || null;
  } catch (error) {
    console.error('Error searching YouTube trailer:', error);
    return null;
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const title = searchParams.get('title');
    const malId = searchParams.get('malId');

    if (!title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }

    const videoId = await searchYouTubeTrailer(
      title,
      malId ? parseInt(malId) : undefined
    );

    if (!videoId) {
      return NextResponse.json(
        { error: 'Trailer not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      videoId,
      embedUrl: `https://www.youtube.com/embed/${videoId}`,
      watchUrl: `https://www.youtube.com/watch?v=${videoId}`
    });
  } catch (error) {
    console.error('Error fetching YouTube trailer:', error);
    return NextResponse.json(
      { error: 'Failed to fetch trailer' },
      { status: 500 }
    );
  }
}

// POST endpoint to manually link a trailer
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await import('next-auth').then(m => m.getServerSession);
    const authOptions = await import('@/lib/auth').then(m => m.authOptions);
    
    const session_data = await session(authOptions);
    if (!session_data || !session_data.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id: animeId } = await params;
    const id = parseInt(animeId, 10);
    const body = await req.json();
    const { videoId, youtubeUrl } = body;

    if (!videoId && !youtubeUrl) {
      return NextResponse.json(
        { error: 'videoId or youtubeUrl is required' },
        { status: 400 }
      );
    }

    let finalVideoId = videoId;
    if (!finalVideoId && youtubeUrl) {
      const match = youtubeUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
      finalVideoId = match?.[1];
    }

    if (!finalVideoId) {
      return NextResponse.json(
        { error: 'Invalid YouTube URL' },
        { status: 400 }
      );
    }

    const { prisma } = await import('@/lib/prisma');
    
    // Check if user is admin or anime creator
    const anime = await prisma.anime.findUnique({
      where: { id },
      select: { createdBy: true }
    });

    if (!anime) {
      return NextResponse.json(
        { error: 'Anime not found' },
        { status: 404 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session_data.user.email },
      select: { id: true, role: true }
    });

    if (!user || (user.role !== 'ADMIN' && user.id !== anime.createdBy)) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    // Update anime with trailer
    const updated = await prisma.anime.update({
      where: { id },
      data: {
        youtubeTrailerId: finalVideoId,
        trailerUrl: `https://www.youtube.com/watch?v=${finalVideoId}`
      }
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating trailer:', error);
    return NextResponse.json(
      { error: 'Failed to update trailer' },
      { status: 500 }
    );
  }
}
