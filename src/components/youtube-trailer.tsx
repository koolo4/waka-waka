'use client';

import { useState } from 'react';
import { Play, Volume2, VolumeX, Maximize, X } from 'lucide-react';

interface YouTubeTrailerProps {
  videoId?: string | null;
  trailerUrl?: string | null;
  title: string;
  compact?: boolean;
}

export function YouTubeTrailer({
  videoId,
  trailerUrl,
  title,
  compact = false
}: YouTubeTrailerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  // Извлекаем YouTube ID из URL если нужно
  let youtubeId = videoId;
  if (!youtubeId && trailerUrl) {
    const match = trailerUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
    youtubeId = match?.[1];
  }

  if (!youtubeId) {
    return null;
  }

  const embedUrl = `https://www.youtube.com/embed/${youtubeId}?${
    isMuted ? 'mute=1' : ''
  }&autoplay=1&rel=0`;

  if (compact) {
    return (
      <div className="space-y-2">
        <button
          onClick={() => setIsOpen(true)}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-red-600 hover:bg-red-700 text-white transition-all font-semibold group"
        >
          <Play size={18} className="group-hover:scale-110 transition-transform" />
          Смотреть трейлер
        </button>

        {/* Modal */}
        {isOpen && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-black rounded-lg max-w-4xl w-full relative">
              {/* Close Button */}
              <button
                onClick={() => setIsOpen(false)}
                className="absolute top-4 right-4 p-2 bg-red-600 hover:bg-red-700 rounded-lg text-white z-10"
              >
                <X size={20} />
              </button>

              {/* Controls */}
              <div className="absolute bottom-4 left-4 flex gap-2 z-10">
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="p-2 bg-gray-800/80 hover:bg-gray-700 rounded-lg text-white transition-all"
                >
                  {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                </button>
              </div>

              {/* Video */}
              <div className="aspect-video">
                <iframe
                  src={embedUrl}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Default view with thumbnail preview
  return (
    <div className="space-y-2">
      <button
        onClick={() => setIsOpen(true)}
        className="relative group cursor-pointer rounded-lg overflow-hidden w-full aspect-video bg-black"
      >
        {/* Thumbnail */}
        <img
          src={`https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          onError={(e) => {
            // Fallback to hq thumbnail if maxresdefault is not available
            (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`;
          }}
        />

        {/* Overlay */}
        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors flex items-center justify-center">
          <div className="p-4 bg-red-600 rounded-full group-hover:scale-110 transition-transform">
            <Play size={32} className="text-white fill-white" />
          </div>
        </div>
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
          <div className="bg-black rounded-lg max-w-5xl w-full relative">
            {/* Close Button */}
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 p-2 bg-red-600 hover:bg-red-700 rounded-lg text-white z-10"
            >
              <X size={20} />
            </button>

            {/* Controls */}
            <div className="absolute bottom-4 left-4 flex gap-2 z-10">
              <button
                onClick={() => setIsMuted(!isMuted)}
                className="p-2 bg-gray-800/80 hover:bg-gray-700 rounded-lg text-white transition-all"
              >
                {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
              </button>
            </div>

            {/* Video */}
            <div className="aspect-video">
              <iframe
                src={embedUrl}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
