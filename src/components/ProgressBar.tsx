import React from 'react';
import { motion } from 'framer-motion';

interface ProgressBarProps {
  current: number;
  total: number;
  showPercentage?: boolean;
}

export default function ProgressBar({ current, total, showPercentage = true }: ProgressBarProps) {
  const percentage = Math.round((current / total) * 100);

  return (
    <div className="w-full">
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5 }}
          className="h-full bg-blue-600 rounded-full"
        />
      </div>
      {showPercentage && (
        <div className="mt-1 text-sm text-gray-600 text-right">
          {percentage}%
        </div>
      )}
    </div>
  );
}