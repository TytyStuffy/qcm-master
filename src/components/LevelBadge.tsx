import React from 'react';
import { Award } from 'lucide-react';

interface LevelBadgeProps {
  level: number;
  xp: number;
  nextLevelXp: number;
}

export default function LevelBadge({ level, xp, nextLevelXp }: LevelBadgeProps) {
  const progress = (xp / nextLevelXp) * 100;

  return (
    <div className="flex items-center space-x-3 bg-gradient-to-r from-blue-50 to-indigo-50 p-3 rounded-lg">
      <div className="p-2 bg-blue-600 rounded-lg">
        <Award className="h-6 w-6 text-white" />
      </div>
      <div>
        <div className="text-sm font-medium text-gray-900">Niveau {level}</div>
        <div className="text-xs text-gray-600">{xp} / {nextLevelXp} XP</div>
        <div className="mt-1 h-1 w-24 bg-gray-200 rounded-full">
          <div
            className="h-full bg-blue-600 rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}