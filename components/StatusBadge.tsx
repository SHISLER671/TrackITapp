'use client';

import React from 'react';
import { VarianceStatus } from '@/lib/types';

interface StatusBadgeProps {
  status: VarianceStatus;
  size?: 'sm' | 'md' | 'lg';
}

export default function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base',
  };

  const statusConfig = {
    NORMAL: {
      bg: 'bg-green-100',
      text: 'text-green-800',
      label: 'Normal',
    },
    WARNING: {
      bg: 'bg-yellow-100',
      text: 'text-yellow-800',
      label: 'Warning',
    },
    CRITICAL: {
      bg: 'bg-red-100',
      text: 'text-red-800',
      label: 'Critical',
    },
  };

  const config = statusConfig[status];

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ${config.bg} ${config.text} ${sizeClasses[size]}`}
    >
      {config.label}
    </span>
  );
}

