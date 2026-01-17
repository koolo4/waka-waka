"use client";

import { useEffect, useState } from "react";
import { useToast } from "@/components/toast-provider";
import Link from "next/link";
import Image from "next/image";

interface RecentlyWatchedItem {
  id: number;
  animeId: number;
  progress: number;
  lastWatchedAt: string;
  anime: {
    id: number;
    title: string;
    imageUrl?: string;
    genre?: string;
    year?: number;
    studio?: string;
  };
}

interface RecentlyWatchedSectionProps {
  userId: number;
  limit?: number;
}

export function RecentlyWatchedSection({
  userId,
  limit = 8,
}: RecentlyWatchedSectionProps) {
  const [items, setItems] = useState<RecentlyWatchedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  useEffect(() => {
    fetchRecentlyWatched();
  }, [userId]);

  async function fetchRecentlyWatched() {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/recently-watched?userId=${userId}&limit=${limit}`
      );
      if (!response.ok) throw new Error("Failed to fetch recently watched");

      const data = await response.json();
      setItems(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching recently watched:", error);
      addToast("Failed to load recently watched", "error");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
        {Array(6)
          .fill(0)
          .map((_, i) => (
            <div
              key={i}
              className="h-32 bg-gray-800/50 rounded-lg animate-pulse"
            ></div>
          ))}
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="text-center py-8 text-gray-400">
        Start watching anime to see your recently watched list! 📺
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-lg font-bold text-white mb-4">Recently Watched</h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
        {items.map((item) => (
          <Link key={item.id} href={`/anime/${item.animeId}`}>
            <div className="group relative rounded-lg overflow-hidden bg-gray-800 hover:scale-105 transition-transform">
              {/* Image */}
              <div className="relative w-full aspect-[3/4] bg-gray-700">
                {item.anime.imageUrl ? (
                  <Image
                    src={item.anime.imageUrl}
                    alt={item.anime.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-500">
                    No Image
                  </div>
                )}

                {/* Progress Bar */}
                {item.progress > 0 && (
                  <div className="absolute bottom-0 left-0 right-0 bg-black/50 h-1">
                    <div
                      className="bg-cyan-500 h-full transition-all"
                      style={{ width: `${Math.min(item.progress, 100)}%` }}
                    ></div>
                  </div>
                )}

                {/* Overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/60 transition-colors flex items-end justify-between p-2 opacity-0 group-hover:opacity-100">
                  <div className="text-xs text-gray-300">
                    {item.progress > 0 && (
                      <p className="font-bold text-cyan-400">
                        {item.progress}%
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Title */}
              <div className="p-2 bg-gray-900">
                <h4 className="text-xs font-bold text-white line-clamp-2 group-hover:text-cyan-400 transition-colors">
                  {item.anime.title}
                </h4>
              </div>

              {/* Last Watched */}
              <div className="text-xs text-gray-500 px-2 pb-2">
                {getRelativeTime(new Date(item.lastWatchedAt))}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

/**
 * Get relative time string (e.g., "2 hours ago")
 */
function getRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString();
}
