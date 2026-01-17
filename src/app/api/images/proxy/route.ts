import { NextRequest, NextResponse } from 'next/server'

/**
 * Image proxy endpoint for external anime images
 * Handles images from MyAnimeList, AniList, and other sources
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const imageUrl = searchParams.get('url')

    if (!imageUrl) {
      return NextResponse.json(
        { error: 'URL parameter is required' },
        { status: 400 }
      )
    }

    // Validate URL (prevent SSRF attacks)
    try {
      const url = new URL(imageUrl)
      // Only allow certain domains
      const allowedDomains = [
        'cdn.myanimelist.net',
        'api.myanimelist.net',
        'cdn.anilist.co',
        's4.anilist.co',
        's.anilist.co',
        'images.unsplash.com',
        'source.unsplash.com',
        'm.media-amazon.com',
        'ext.same-assets.com',
        'ugc.same-assets.com',
        's3.eu-central-1.wasabisys.com'
      ]

      const isAllowed = allowedDomains.some(domain => 
        url.hostname.endsWith(domain) || url.hostname === domain
      )

      if (!isAllowed) {
        console.warn(`Image domain not allowed: ${url.hostname}`)
        return NextResponse.json(
          { error: 'Domain not allowed' },
          { status: 403 }
        )
      }
    } catch (e) {
      return NextResponse.json(
        { error: 'Invalid URL' },
        { status: 400 }
      )
    }

    // Fetch the image with appropriate headers
    const response = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Referer': 'https://myanimelist.net/',
      },
      next: { revalidate: 86400 } // Cache for 24 hours
    })

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch image: ${response.statusText}` },
        { status: response.status }
      )
    }

    // Get content type
    const contentType = response.headers.get('content-type') || 'image/jpeg'

    // Create new response with image
    const imageBuffer = await response.arrayBuffer()

    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400, immutable',
        'Access-Control-Allow-Origin': '*',
      },
    })
  } catch (error) {
    console.error('Image proxy error:', error)
    return NextResponse.json(
      { error: 'Failed to proxy image' },
      { status: 500 }
    )
  }
}
