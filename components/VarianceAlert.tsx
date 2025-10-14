'use client';

import React from 'react';
import { VarianceStatus } from '@/lib/types';
import StatusBadge from './StatusBadge';

interface VarianceAlertProps {
  variance: number;
  status: VarianceStatus;
  kegName: string;
  onInvestigate?: () => void;
}

export default function VarianceAlert({
  variance,
  status,
  kegName,
  onInvestigate,
}: VarianceAlertProps) {
  if (status === 'NORMAL') {
    return null;
  }

  const config = {
    WARNING: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      icon: '⚠️',
      title: 'Variance Warning',
      message: 'This keg has a higher than expected variance.',
    },
    CRITICAL: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      icon: '🚨',
      title: 'Critical Variance Alert',
      message: 'This keg requires immediate investigation.',
    },
  };

  const alertConfig = config[status === 'CRITICAL' ? 'CRITICAL' : 'WARNING'];

  return (
    <div
      className={`rounded-lg border-2 p-4 ${alertConfig.bg} ${alertConfig.border}`}
    >
      <div className="flex items-start">
        <span className="text-2xl mr-3">{alertConfig.icon}</span>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-gray-900">
              {alertConfig.title}
            </h3>
            <StatusBadge status={status} />
          </div>
          <p className="text-sm text-gray-700 mb-2">{alertConfig.message}</p>
          <div className="bg-white rounded px-3 py-2 mb-3">
            <p className="text-sm">
              <span className="font-semibold">{kegName}</span> has a variance of{' '}
              <span
                className={`font-bold ${
                  status === 'CRITICAL' ? 'text-red-600' : 'text-yellow-600'
                }`}
              >
                {variance > 0 ? '+' : ''}
                {variance} pints
              </span>
            </p>
          </div>
          {onInvestigate && (
            <button
              onClick={onInvestigate}
              className={`px-4 py-2 rounded-md text-sm font-medium text-white transition-colors ${
                status === 'CRITICAL'
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-yellow-600 hover:bg-yellow-700'
              }`}
            >
              Investigate Variance
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

