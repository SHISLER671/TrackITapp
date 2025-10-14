'use client';

import React, { useState } from 'react';
import { Scanner } from '@yudiel/react-qr-scanner';
import { parseQRCode } from '@/lib/types';

interface QRScannerProps {
  onScan: (tokenId: string, contractAddress: string) => void;
  onError?: (error: string) => void;
}

export default function QRScanner({ onScan, onError }: QRScannerProps) {
  const [scanning, setScanning] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleScan = (result: any) => {
    if (!result || !scanning) return;

    try {
      const text = typeof result === 'string' ? result : result[0]?.rawValue;
      
      if (!text) {
        return;
      }

      const parsed = parseQRCode(text);

      if (!parsed) {
        const errorMsg = 'Invalid QR code format. Please scan a valid keg QR code.';
        setError(errorMsg);
        onError?.(errorMsg);
        return;
      }

      // Haptic feedback if supported
      if ('vibrate' in navigator) {
        navigator.vibrate(200);
      }

      setScanning(false);
      onScan(parsed.tokenId, parsed.contract);
    } catch (err) {
      const errorMsg = 'Error scanning QR code. Please try again.';
      setError(errorMsg);
      onError?.(errorMsg);
    }
  };

  const handleError = (error: any) => {
    console.error('QR Scanner error:', error);
    const errorMsg = 'Camera access denied or not available. Please check your permissions.';
    setError(errorMsg);
    onError?.(errorMsg);
  };

  return (
    <div className="relative w-full h-full">
      {/* Scanner View */}
      <div className="w-full h-full">
        {scanning && (
          <Scanner
            onScan={handleScan}
            onError={handleError}
            constraints={{
              facingMode: 'environment',
            }}
            styles={{
              container: {
                width: '100%',
                height: '100%',
              },
            }}
          />
        )}
      </div>

      {/* Overlay Guide */}
      {scanning && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-black bg-opacity-40" />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="w-64 h-64 border-4 border-white rounded-lg relative">
              {/* Corner guides */}
              <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-blue-500 rounded-tl-lg" />
              <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-blue-500 rounded-tr-lg" />
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-blue-500 rounded-bl-lg" />
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-blue-500 rounded-br-lg" />
            </div>
            <p className="text-white text-center mt-4 text-sm font-medium">
              Position QR code within the frame
            </p>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="absolute bottom-4 left-4 right-4 bg-red-500 text-white px-4 py-3 rounded-lg shadow-lg">
          <p className="text-sm">{error}</p>
          <button
            onClick={() => {
              setError(null);
              setScanning(true);
            }}
            className="mt-2 text-sm underline"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Success State */}
      {!scanning && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-green-500">
          <div className="text-center text-white">
            <svg
              className="mx-auto h-16 w-16 mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            <p className="text-xl font-bold">Scan Successful!</p>
          </div>
        </div>
      )}
    </div>
  );
}

