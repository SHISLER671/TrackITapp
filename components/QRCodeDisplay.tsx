'use client';

import React, { useEffect, useState } from 'react';
import { generateQRCode } from '@/lib/qr-generator';

interface QRCodeDisplayProps {
  contractAddress: string;
  tokenId: string;
  kegName?: string;
  size?: number;
  showDownload?: boolean;
}

export default function QRCodeDisplay({
  contractAddress,
  tokenId,
  kegName,
  size = 256,
  showDownload = true,
}: QRCodeDisplayProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function generateQR() {
      try {
        setLoading(true);
        const dataUrl = await generateQRCode(contractAddress, tokenId, { size });
        setQrDataUrl(dataUrl);
      } catch (err) {
        console.error('Error generating QR code:', err);
        setError('Failed to generate QR code');
      } finally {
        setLoading(false);
      }
    }

    generateQR();
  }, [contractAddress, tokenId, size]);

  const handleDownload = () => {
    if (!qrDataUrl) return;

    const link = document.createElement('a');
    link.download = `keg-${tokenId}-qr.png`;
    link.href = qrDataUrl;
    link.click();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !qrDataUrl) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
        <p className="text-red-700">{error || 'Failed to generate QR code'}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
        <img src={qrDataUrl} alt="Keg QR Code" className="w-full h-auto" />
      </div>
      {kegName && (
        <p className="mt-3 text-sm font-medium text-gray-700">{kegName}</p>
      )}
      <p className="text-xs text-gray-500 mt-1">ID: {tokenId}</p>
      {showDownload && (
        <button
          onClick={handleDownload}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          Download QR Code
        </button>
      )}
    </div>
  );
}
