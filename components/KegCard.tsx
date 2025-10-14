'use client';

import React from 'react';
import { Keg, formatABV } from '@/lib/types';
import { format } from 'date-fns';
import StatusBadge from './StatusBadge';
import ProgressBar from './ProgressBar';

interface KegCardProps {
  keg: Keg;
  onClick?: () => void;
  showProgress?: boolean;
  showVariance?: boolean;
}

export default function KegCard({
  keg,
  onClick,
  showProgress = false,
  showVariance = false,
}: KegCardProps) {
  const fillPercentage = keg.expected_pints > 0 
    ? ((keg.expected_pints - keg.pints_sold) / keg.expected_pints) * 100
    : 0;

  return (
    <div
      className={`bg-white rounded-lg shadow-md p-4 border border-gray-200 ${
        onClick ? 'cursor-pointer hover:shadow-lg transition-shadow' : ''
      }`}
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h3 className="text-lg font-bold text-gray-900">{keg.name}</h3>
          <p className="text-sm text-gray-600">{keg.type}</p>
        </div>
        {keg.is_empty && (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            Empty
          </span>
        )}
      </div>

      {/* Specs */}
      <div className="grid grid-cols-3 gap-2 mb-3 text-sm">
        <div>
          <span className="text-gray-500 block">ABV</span>
          <span className="font-semibold text-gray-900">{formatABV(keg.abv)}</span>
        </div>
        <div>
          <span className="text-gray-500 block">IBU</span>
          <span className="font-semibold text-gray-900">{keg.ibu}</span>
        </div>
        <div>
          <span className="text-gray-500 block">Size</span>
          <span className="font-semibold text-gray-900">{keg.keg_size}</span>
        </div>
      </div>

      {/* Progress Bar */}
      {showProgress && !keg.is_empty && (
        <div className="mb-3">
          <div className="flex justify-between text-xs text-gray-600 mb-1">
            <span>Fill Level</span>
            <span>
              {keg.expected_pints - keg.pints_sold} / {keg.expected_pints} pints
            </span>
          </div>
          <ProgressBar percentage={fillPercentage} />
        </div>
      )}

      {/* Variance */}
      {showVariance && keg.is_empty && (
        <div className="mb-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Variance</span>
            <div className="flex items-center gap-2">
              <span className={`text-sm font-semibold ${
                Math.abs(keg.variance) <= 3 ? 'text-green-600' : 
                Math.abs(keg.variance) <= 8 ? 'text-yellow-600' : 
                'text-red-600'
              }`}>
                {keg.variance > 0 ? '+' : ''}{keg.variance} pints
              </span>
              <StatusBadge status={keg.variance_status} size="sm" />
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="pt-3 border-t border-gray-200">
        <div className="flex justify-between items-center text-xs text-gray-500">
          <span>Brewed {format(new Date(keg.brew_date), 'MMM d, yyyy')}</span>
          {keg.last_scan && (
            <span>Last scan {format(new Date(keg.last_scan), 'MMM d')}</span>
          )}
        </div>
      </div>
    </div>
  );
}

