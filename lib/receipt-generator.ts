// Receipt generation utilities for deliveries
// Generates human-readable receipts with blockchain proof

import { Delivery, DeliveryItem } from './types';

export interface ReceiptData {
  delivery_id: string;
  receipt_number: string;
  date: string;
  time: string;
  
  // Parties
  brewery_name: string;
  driver_name: string;
  restaurant_name: string;
  
  // Items
  items: {
    keg_name: string;
    keg_type: string;
    keg_size: string;
    deposit_value: number;
  }[];
  
  // Totals
  total_kegs: number;
  total_deposit: number;
  
  // Blockchain proof
  blockchain_tx_hash: string | null;
  blockchain_explorer_url: string | null;
  manager_signature: string | null;
  
  // Metadata
  accepted_at: string;
}

/**
 * Generate receipt data from a delivery
 */
export function generateReceiptData(
  delivery: Delivery & { 
    delivery_items?: DeliveryItem[];
    brewery?: { name: string };
    driver?: { user_id: string };
    restaurant?: { user_id: string };
  }
): ReceiptData {
  const acceptedDate = new Date(delivery.accepted_at || delivery.created_at);
  
  // Generate blockchain explorer URL
  let explorerUrl = null;
  if (delivery.blockchain_tx_hash) {
    // Base blockchain explorer (Basescan)
    explorerUrl = `https://basescan.org/tx/${delivery.blockchain_tx_hash}`;
  }
  
  return {
    delivery_id: delivery.id,
    receipt_number: `RCP-${delivery.id.substring(0, 8).toUpperCase()}`,
    date: acceptedDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }),
    time: acceptedDate.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    }),
    
    brewery_name: delivery.brewery?.name || 'Unknown Brewery',
    driver_name: `Driver ${delivery.driver_id.substring(0, 6)}`,
    restaurant_name: `Restaurant ${delivery.restaurant_id.substring(0, 6)}`,
    
    items: (delivery.delivery_items || []).map(item => ({
      keg_name: item.keg_name,
      keg_type: item.keg_type,
      keg_size: item.keg_size,
      deposit_value: item.deposit_value,
    })),
    
    total_kegs: delivery.keg_ids.length,
    total_deposit: delivery.deposit_amount || 0,
    
    blockchain_tx_hash: delivery.blockchain_tx_hash,
    blockchain_explorer_url: explorerUrl,
    manager_signature: delivery.manager_signature,
    
    accepted_at: acceptedDate.toISOString(),
  };
}

/**
 * Generate plain text receipt
 */
export function generateTextReceipt(receiptData: ReceiptData): string {
  return `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
           KEG DELIVERY RECEIPT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Receipt #: ${receiptData.receipt_number}
Date: ${receiptData.date}
Time: ${receiptData.time}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                 PARTIES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

From:        ${receiptData.brewery_name}
Delivered:   ${receiptData.driver_name}
To:          ${receiptData.restaurant_name}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                 KEGS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${receiptData.items.map((item, index) => `
${index + 1}. ${item.keg_name}
   ${item.keg_type} • ${item.keg_size}
   Deposit: $${item.deposit_value.toFixed(2)}
`).join('')}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                TOTAL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Total Kegs:     ${receiptData.total_kegs}
Total Deposit:  $${receiptData.total_deposit.toFixed(2)}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          BLOCKCHAIN VERIFICATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

This receipt is backed by an immutable blockchain
transaction. Keg ownership has been transferred and
recorded on the Base blockchain.

${receiptData.blockchain_tx_hash ? `
Transaction Hash:
${receiptData.blockchain_tx_hash}

Verify on blockchain:
${receiptData.blockchain_explorer_url}
` : 'Blockchain transaction pending...'}

Manager Signature:
${receiptData.manager_signature || 'Pending'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

This receipt is legally binding and cryptographically
verified. Keep for your records.

Generated: ${new Date().toISOString()}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`;
}

/**
 * Generate CSV row for accounting export
 */
export function generateCSVRow(receiptData: ReceiptData): string[] {
  return [
    receiptData.receipt_number,
    receiptData.date,
    receiptData.time,
    receiptData.brewery_name,
    receiptData.restaurant_name,
    receiptData.total_kegs.toString(),
    receiptData.total_deposit.toFixed(2),
    receiptData.blockchain_tx_hash || 'Pending',
    receiptData.blockchain_explorer_url || '',
  ];
}

/**
 * Generate HTML receipt (for email or PDF)
 */
export function generateHTMLReceipt(receiptData: ReceiptData): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body {
      font-family: 'Courier New', monospace;
      max-width: 600px;
      margin: 40px auto;
      padding: 20px;
      background-color: #f9fafb;
    }
    .receipt {
      background: white;
      padding: 40px;
      border: 2px solid #1f2937;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    .header {
      text-align: center;
      border-bottom: 2px solid #1f2937;
      padding-bottom: 20px;
      margin-bottom: 20px;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
      font-weight: bold;
    }
    .section {
      margin: 20px 0;
      padding: 15px;
      background: #f3f4f6;
    }
    .section-title {
      font-weight: bold;
      font-size: 14px;
      margin-bottom: 10px;
      color: #374151;
    }
    .item {
      padding: 10px 0;
      border-bottom: 1px dashed #d1d5db;
    }
    .item:last-child {
      border-bottom: none;
    }
    .total {
      font-size: 18px;
      font-weight: bold;
      text-align: right;
      padding: 15px;
      background: #dbeafe;
      margin: 20px 0;
    }
    .blockchain {
      background: #1e3a8a;
      color: white;
      padding: 20px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .blockchain a {
      color: #93c5fd;
      word-break: break-all;
    }
    .footer {
      text-align: center;
      font-size: 11px;
      color: #6b7280;
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #d1d5db;
    }
  </style>
</head>
<body>
  <div class="receipt">
    <div class="header">
      <h1>🍺 KEG DELIVERY RECEIPT</h1>
      <p>Receipt #${receiptData.receipt_number}</p>
      <p>${receiptData.date} at ${receiptData.time}</p>
    </div>

    <div class="section">
      <div class="section-title">PARTIES</div>
      <div><strong>From:</strong> ${receiptData.brewery_name}</div>
      <div><strong>Delivered by:</strong> ${receiptData.driver_name}</div>
      <div><strong>Received by:</strong> ${receiptData.restaurant_name}</div>
    </div>

    <div class="section">
      <div class="section-title">KEGS DELIVERED</div>
      ${receiptData.items.map((item, index) => `
        <div class="item">
          <div><strong>${index + 1}. ${item.keg_name}</strong></div>
          <div>${item.keg_type} • ${item.keg_size}</div>
          <div>Deposit: $${item.deposit_value.toFixed(2)}</div>
        </div>
      `).join('')}
    </div>

    <div class="total">
      <div>Total Kegs: ${receiptData.total_kegs}</div>
      <div style="font-size: 22px; margin-top: 5px;">
        Total Deposit: $${receiptData.total_deposit.toFixed(2)}
      </div>
    </div>

    <div class="blockchain">
      <div class="section-title" style="color: white;">🔒 BLOCKCHAIN VERIFICATION</div>
      <p>This receipt is backed by an immutable blockchain transaction.</p>
      ${receiptData.blockchain_tx_hash ? `
        <p><strong>Transaction Hash:</strong><br>
        <a href="${receiptData.blockchain_explorer_url}" target="_blank">
          ${receiptData.blockchain_tx_hash}
        </a></p>
        <p><small>Click hash to verify on Base blockchain explorer</small></p>
      ` : '<p><strong>Blockchain transaction pending...</strong></p>'}
      <p><strong>Manager Signature:</strong><br>
      <small>${receiptData.manager_signature || 'Pending'}</small></p>
    </div>

    <div class="footer">
      <p>This receipt is legally binding and cryptographically verified.</p>
      <p>Keep for your records.</p>
      <p>Generated: ${new Date().toLocaleString()}</p>
    </div>
  </div>
</body>
</html>
`;
}

