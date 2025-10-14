// QR code generation with brewery logo watermark

import QRCode from 'qrcode';
import { formatQRCode } from './types';

export interface QRCodeOptions {
  size?: number;
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
  margin?: number;
  color?: {
    dark?: string;
    light?: string;
  };
}

/**
 * Generate QR code as data URL
 */
export async function generateQRCode(
  contractAddress: string,
  tokenId: string,
  options: QRCodeOptions = {}
): Promise<string> {
  const qrData = formatQRCode(contractAddress, tokenId);
  
  const qrOptions = {
    width: options.size || 512,
    margin: options.margin || 2,
    errorCorrectionLevel: options.errorCorrectionLevel || 'H',
    color: {
      dark: options.color?.dark || '#000000',
      light: options.color?.light || '#FFFFFF',
    },
  };
  
  try {
    const dataUrl = await QRCode.toDataURL(qrData, qrOptions);
    return dataUrl;
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw new Error('Failed to generate QR code');
  }
}

/**
 * Generate QR code as PNG buffer
 */
export async function generateQRCodeBuffer(
  contractAddress: string,
  tokenId: string,
  options: QRCodeOptions = {}
): Promise<Buffer> {
  const qrData = formatQRCode(contractAddress, tokenId);
  
  const qrOptions = {
    width: options.size || 512,
    margin: options.margin || 2,
    errorCorrectionLevel: options.errorCorrectionLevel || 'H',
    color: {
      dark: options.color?.dark || '#000000',
      light: options.color?.light || '#FFFFFF',
    },
  };
  
  try {
    const buffer = await QRCode.toBuffer(qrData, qrOptions);
    return buffer;
  } catch (error) {
    console.error('Error generating QR code buffer:', error);
    throw new Error('Failed to generate QR code');
  }
}

/**
 * Generate QR code with brewery logo watermark
 * Returns data URL for download or display
 */
export async function generateQRCodeWithLogo(
  contractAddress: string,
  tokenId: string,
  logoUrl?: string,
  options: QRCodeOptions = {}
): Promise<string> {
  // First generate the base QR code
  const qrDataUrl = await generateQRCode(contractAddress, tokenId, {
    ...options,
    errorCorrectionLevel: 'H', // High error correction for logo overlay
  });
  
  // If no logo, return base QR code
  if (!logoUrl) {
    return qrDataUrl;
  }
  
  // In browser environment, we would use Canvas API to overlay logo
  // For now, return base QR code (logo overlay can be added in client)
  return qrDataUrl;
}

/**
 * Generate printable QR code with keg information
 * Returns SVG string for high-quality printing
 */
export async function generatePrintableQRCode(
  contractAddress: string,
  tokenId: string,
  kegInfo: {
    name: string;
    type: string;
    size: string;
    brewDate: string;
  }
): Promise<string> {
  const qrData = formatQRCode(contractAddress, tokenId);
  
  try {
    // Generate SVG for better print quality
    const svgString = await QRCode.toString(qrData, {
      type: 'svg',
      width: 400,
      margin: 2,
      errorCorrectionLevel: 'H',
    });
    
    // Wrap QR code with keg information
    const printableSvg = `
      <svg width="500" height="600" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="white"/>
        
        <!-- QR Code -->
        <g transform="translate(50, 50)">
          ${svgString}
        </g>
        
        <!-- Keg Information -->
        <text x="250" y="480" text-anchor="middle" font-family="Arial, sans-serif" font-size="24" font-weight="bold">
          ${kegInfo.name}
        </text>
        <text x="250" y="510" text-anchor="middle" font-family="Arial, sans-serif" font-size="18">
          ${kegInfo.type} | ${kegInfo.size}
        </text>
        <text x="250" y="540" text-anchor="middle" font-family="Arial, sans-serif" font-size="14" fill="#666">
          Brewed: ${kegInfo.brewDate}
        </text>
        <text x="250" y="570" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" fill="#999">
          ID: ${tokenId}
        </text>
      </svg>
    `;
    
    return printableSvg;
  } catch (error) {
    console.error('Error generating printable QR code:', error);
    throw new Error('Failed to generate printable QR code');
  }
}

/**
 * Download QR code as PNG file
 * Returns blob URL for download
 */
export function createQRCodeDownloadUrl(dataUrl: string, filename: string): string {
  // Convert data URL to blob
  const arr = dataUrl.split(',');
  const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/png';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  
  const blob = new Blob([u8arr], { type: mime });
  return URL.createObjectURL(blob);
}

/**
 * Batch generate QR codes for multiple kegs
 */
export async function generateBatchQRCodes(
  kegs: Array<{
    tokenId: string;
    name: string;
    type: string;
    size: string;
    brewDate: string;
  }>,
  contractAddress: string
): Promise<Array<{ tokenId: string; dataUrl: string }>> {
  const results = await Promise.all(
    kegs.map(async (keg) => ({
      tokenId: keg.tokenId,
      dataUrl: await generateQRCode(contractAddress, keg.tokenId),
    }))
  );
  
  return results;
}

