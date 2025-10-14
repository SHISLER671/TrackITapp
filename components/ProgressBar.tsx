'use client';

import React from 'react';

interface ProgressBarProps {
  percentage: number;
  height?: number;
  showLabel?: boolean;
}

export default function ProgressBar({
  percentage,
  height = 8,
  showLabel = false,
}: ProgressBarProps) {
  // Clamp percentage between 0 and 100
  const clampedPercentage = Math.max(0, Math.min(100, percentage));

  // Color based on fill level
  const getColor = () => {
    if (clampedPercentage > 50) return 'bg-green-500';
    if (clampedPercentage > 25) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="w-full">
      <div
        className="w-full bg-gray-200 rounded-full overflow-hidden"
        style={{ height: `${height}px` }}
      >
        <div
          className={`h-full ${getColor()} transition-all duration-300 ease-in-out`}
          style={{ width: `${clampedPercentage}%` }}
        />
      </div>
      {showLabel && (
        <div className="text-right text-xs text-gray-600 mt-1">
          {clampedPercentage.toFixed(0)}%
        </div>
      )}
    </div>
  );
}

