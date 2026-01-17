'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Loader2, Filter, SortAsc } from 'lucide-react';

interface AnimeInList {
  id: string;
  status: string;
  currentEpisode: number;
  totalEpisodes: number;
  watchPercentage: number;
  rating: number;
  isFavorite: boolean;
  createdAt: string;
  anime: {
    id: string;
    title: string;
    image: string;
    episodes: number;
    creator: {
      id: string;
      username: string;
      avatar: string | null;
    };
    ratings: Array<{
      id: string;
      score: number;
    }>;
    _count: {
      comments: number;
      ratings: number;
    };
  };
}

interface UserListsProps {
  userId: string;
}

export function UserListsDisplay({ userId }: UserListsProps) {
  const [lists, setLists] = useState<AnimeInList[]>([]);
  const [stats, setStats] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState('createdAt');

  useEffect(() => {
    fetchLists();
  }, [userId, selectedStatus, sortBy]);

  const fetchLists = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedStatus) params.append('status', selectedStatus);
      params.append('sort', sortBy);
      params.append('order', 'desc');

      const response = await fetch(`/api/users/${userId}/lists?${params}`);
      if (!response.ok) throw new Error('Failed to fetch lists');

      const data = await response.json();
      setLists(data.data);
      setStats(data.stats);
    } catch (error) {
      console.error('Error fetching lists:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const statuses = [
    { value: 'WATCH_LATER', label: 'В планах', color: 'bg-blue-500' },
    { value: 'WATCHING', label: 'Смотрю', color: 'bg-green-500' },
    { value: 'COMPLETED', label: 'Завершено', color: 'bg-purple-500' },
    { value: 'DROPPED', label: 'Брошено', color: 'bg-red-500' }
  ];

  const getStatusLabel = (status: string) => {
    return statuses.find(s => s.value === status)?.label || status;
  };

  const getStatusColor = (status: string) => {
    return statuses.find(s => s.value === status)?.color || 'bg-gray-500';
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="animate-spin" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statuses.map(({ value, label, color }) => (
          <div
            key={value}
            className={`${color} text-white rounded-lg p-4 text-center cursor-pointer hover:opacity-90 transition-all`}
            onClick={() => setSelectedStatus(selectedStatus === value ? null : value)}
          >
            <p className="text-2xl font-bold">{stats[value] || 0}</p>
            <p className="text-sm">{label}</p>
          </div>
        ))}
      </div>

      {/* Filters & Sort */}
      <div className="flex gap-4 flex-wrap">
        <div className="flex gap-2 flex-wrap">
          {statuses.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setSelectedStatus(selectedStatus === value ? null : value)}
              className={`px-3 py-1 rounded-lg transition-all text-sm ${
                selectedStatus === value
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-3 py-1 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm"
        >
          <option value="createdAt">Недавнее</option>
          <option value="rating">Рейтинг</option>
          <option value="progress">Прогресс</option>
        </select>
      </div>

      {/* Anime Grid */}
      {lists.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">Список пуст</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {lists.map((item) => (
            <Link key={item.id} href={`/anime/${item.anime.id}`}>
              <div className="group cursor-pointer h-full">
                <div className="relative aspect-[3/4] mb-3 overflow-hidden rounded-lg">
                  <Image
                    src={item.anime.image}
                    alt={item.anime.title}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                  />

                  {/* Status Badge */}
                  <div className={`absolute top-2 right-2 ${getStatusColor(item.status)} text-white text-xs px-2 py-1 rounded`}>
                    {getStatusLabel(item.status)}
                  </div>

                  {/* Favorite Star */}
                  {item.isFavorite && (
                    <div className="absolute top-2 left-2 bg-red-500 text-white text-lg">⭐</div>
                  )}

                  {/* Progress Bar */}
                  {item.status === 'WATCHING' && (
                    <div className="absolute bottom-0 w-full h-1 bg-gray-800 bg-opacity-50">
                      <div
                        className="h-full bg-blue-500"
                        style={{ width: `${item.watchPercentage}%` }}
                      />
                    </div>
                  )}
                </div>

                <h3 className="font-semibold text-sm line-clamp-2 dark:text-gray-200">
                  {item.anime.title}
                </h3>

                {/* Progress */}
                {item.status === 'WATCHING' && (
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {item.currentEpisode}/{item.anime.episodes} эпизодов
                  </p>
                )}

                {/* Rating */}
                {item.rating > 0 && (
                  <p className="text-xs text-yellow-500 font-semibold">
                    ⭐ {item.rating}/10
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
