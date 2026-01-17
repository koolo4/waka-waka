"use client";

import { useEffect, useState } from "react";
import { useToast } from "@/components/toast-provider";

interface ActivityStreak {
  id: number;
  currentStreak: number;
  maxStreak: number;
  lastActivityAt: string;
}

interface ActivityStreakDisplayProps {
  userId: number;
}

export function ActivityStreakDisplay({ userId }: ActivityStreakDisplayProps) {
  const [streak, setStreak] = useState<ActivityStreak | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { addToast } = useToast();

  useEffect(() => {
    if (userId) {
      fetchStreak();
    }
  }, [userId]);

  async function fetchStreak() {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/streak?userId=${userId}`);
      if (!response.ok) throw new Error("Failed to fetch streak");

      const data = await response.json();
      setStreak(data);
    } catch (error) {
      console.error("Error fetching streak:", error);
      setError("Failed to load streak");
      addToast("Failed to load activity streak", "error");
    } finally {
      setLoading(false);
    }
  }

  async function updateStreak() {
    try {
      const response = await fetch(`/api/streak`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      if (!response.ok) throw new Error("Failed to update streak");

      await fetchStreak();
      addToast("Activity logged!", "success");
    } catch (error) {
      console.error("Error updating streak:", error);
      addToast("Failed to log activity", "error");
    }
  }

  if (!userId) return null;

  if (loading) {
    return <div className="h-20 bg-gray-800/50 rounded-lg animate-pulse"></div>;
  }

  if (error) {
    return (
      <div className="bg-red-900/20 border border-red-600/50 rounded-lg p-4 text-red-400 text-sm">
        {error}
      </div>
    );
  }

  if (!streak) return null;

  const fireEmojis = Array(Math.min(streak.currentStreak, 10))
    .fill("🔥")
    .join("");

  return (
    <div className="bg-gradient-to-r from-orange-900/30 to-red-900/30 border border-orange-600/50 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-white">Activity Streak</h3>
        <button
          onClick={updateStreak}
          className="text-xs px-2 py-1 bg-orange-600 hover:bg-orange-700 rounded text-white transition-colors"
        >
          Log Activity
        </button>
      </div>

      <div className="space-y-2">
        {/* Current Streak */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🔥</span>
            <div>
              <p className="text-sm font-bold text-orange-300">
                Current Streak
              </p>
              <p className="text-xs text-gray-400">Keep the fire burning!</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-orange-400">
              {streak.currentStreak}
            </p>
            <p className="text-xs text-gray-400">days</p>
          </div>
        </div>

        {/* Max Streak */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">⭐</span>
            <div>
              <p className="text-sm font-bold text-yellow-300">Best Streak</p>
              <p className="text-xs text-gray-400">Your personal record</p>
            </div>
          </div>
          <p className="text-xl font-bold text-yellow-400">{streak.maxStreak}</p>
        </div>

        {/* Visual Representation */}
        <div className="mt-3 pt-3 border-t border-gray-700">
          <p className="text-xs text-gray-400 mb-2">Fire level:</p>
          <div className="text-lg">
            {fireEmojis || "Start your streak today!"}
          </div>
        </div>

        {/* Last Activity */}
        <div className="text-xs text-gray-500 mt-2">
          Last activity:{" "}
          {new Date(streak.lastActivityAt).toLocaleDateString()}
        </div>
      </div>
    </div>
  );
}
