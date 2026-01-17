'use client';

import { useState } from 'react';
import { Heart, Plus, Check } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface AnimeListManagerProps {
  animeId: string;
  animeName: string;
  totalEpisodes: number;
  onStatusChange?: () => void;
}

export function AnimeListManager({
  animeId,
  animeName,
  totalEpisodes,
  onStatusChange
}: AnimeListManagerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentStatus, setCurrentStatus] = useState<string | null>(null);
  const [currentEpisode, setCurrentEpisode] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const { toast } = useToast();

  const statuses = [
    { value: 'WATCH_LATER', label: 'В планах', color: 'bg-blue-500' },
    { value: 'WATCHING', label: 'Смотрю', color: 'bg-green-500' },
    { value: 'COMPLETED', label: 'Завершено', color: 'bg-purple-500' },
    { value: 'DROPPED', label: 'Брошено', color: 'bg-red-500' }
  ];

  const handleAddToList = async (status: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/anime/${animeId}/list`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status,
          currentEpisode: 0,
          isFavorite: false
        })
      });

      if (!response.ok) {
        throw new Error('Failed to add anime to list');
      }

      const data = await response.json();
      setCurrentStatus(status);
      setIsOpen(false);
      toast({
        title: 'Успешно',
        description: `${animeName} добавлено в список`,
        variant: 'default'
      });
      onStatusChange?.();
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось добавить аниме в список',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (newStatus: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/anime/${animeId}/list`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: newStatus,
          currentEpisode
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update status');
      }

      setCurrentStatus(newStatus);
      toast({
        title: 'Успешно',
        description: 'Статус обновлён',
        variant: 'default'
      });
      onStatusChange?.();
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось обновить статус',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleFavorite = async () => {
    if (!currentStatus) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/anime/${animeId}/list`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          isFavorite: !isFavorite
        })
      });

      if (!response.ok) {
        throw new Error('Failed to toggle favorite');
      }

      setIsFavorite(!isFavorite);
      toast({
        title: 'Успешно',
        description: isFavorite ? 'Удалено из избранного' : 'Добавлено в избранное',
        variant: 'default'
      });
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось обновить избранное',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative">
      <div className="flex gap-2">
        <button
          onClick={() => setIsOpen(!isOpen)}
          disabled={isLoading}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
            currentStatus
              ? 'bg-green-500 hover:bg-green-600 text-white'
              : 'bg-blue-500 hover:bg-blue-600 text-white'
          } disabled:opacity-50`}
        >
          {currentStatus ? <Check size={16} /> : <Plus size={16} />}
          {currentStatus ? 'В списке' : 'Добавить'}
        </button>

        {currentStatus && (
          <button
            onClick={handleToggleFavorite}
            disabled={isLoading}
            className={`p-2 rounded-lg transition-all ${
              isFavorite
                ? 'bg-red-500 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
            } hover:bg-red-500 hover:text-white disabled:opacity-50`}
          >
            <Heart size={16} fill={isFavorite ? 'white' : 'none'} />
          </button>
        )}
      </div>

      {isOpen && !currentStatus && (
        <div className="absolute top-full left-0 mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3 z-50 min-w-max">
          <p className="text-sm font-semibold mb-3 dark:text-gray-200">Выберите статус:</p>
          <div className="space-y-2">
            {statuses.map(({ value, label, color }) => (
              <button
                key={value}
                onClick={() => handleAddToList(value)}
                disabled={isLoading}
                className={`w-full text-left px-3 py-2 rounded-lg transition-all ${color} text-white hover:opacity-90 disabled:opacity-50`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      )}

      {currentStatus && (
        <div className="absolute top-full left-0 mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 z-50 min-w-max">
          <p className="text-sm font-semibold mb-3 dark:text-gray-200">Изменить статус:</p>
          <div className="space-y-2 mb-4">
            {statuses.map(({ value, label, color }) => (
              <button
                key={value}
                onClick={() => handleUpdateStatus(value)}
                disabled={isLoading || value === currentStatus}
                className={`w-full text-left px-3 py-2 rounded-lg transition-all ${
                  value === currentStatus
                    ? `${color} text-white`
                    : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 dark:text-gray-200'
                } disabled:opacity-50`}
              >
                {label}
              </button>
            ))}
          </div>

          {currentStatus === 'WATCHING' && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <label className="text-sm font-semibold dark:text-gray-200 block mb-2">
                Серия: {currentEpisode}/{totalEpisodes}
              </label>
              <input
                type="range"
                min="0"
                max={totalEpisodes}
                value={currentEpisode}
                onChange={(e) => setCurrentEpisode(parseInt(e.target.value))}
                className="w-full"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
