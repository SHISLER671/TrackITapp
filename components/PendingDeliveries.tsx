'use client';

import React, { useEffect, useState } from 'react';
import { Delivery, DeliveryItem } from '@/lib/types';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';

interface PendingDeliveriesProps {
  onDeliveryAccepted?: () => void;
}

interface DeliveryWithItems extends Delivery {
  delivery_items?: DeliveryItem[];
  brewery?: { id: string; name: string; logo_url: string | null };
}

export default function PendingDeliveries({ onDeliveryAccepted }: PendingDeliveriesProps) {
  const [deliveries, setDeliveries] = useState<DeliveryWithItems[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    fetchPendingDeliveries();
    
    // Poll for new deliveries every 30 seconds
    const interval = setInterval(fetchPendingDeliveries, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchPendingDeliveries = async () => {
    try {
      const response = await fetch('/api/deliveries?status=pending');
      
      if (!response.ok) {
        throw new Error('Failed to fetch deliveries');
      }
      
      const data = await response.json();
      setDeliveries(data.deliveries || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load deliveries');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (deliveryId: string) => {
    setProcessingId(deliveryId);
    setError(null);

    try {
      // Generate a simple signature (in production, use wallet signature)
      const signature = `manager-sig-${Date.now()}`;
      
      const response = await fetch(`/api/deliveries/${deliveryId}/accept`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ signature }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to accept delivery');
      }

      const data = await response.json();
      
      // Show success notification
      alert(`✅ Delivery accepted!\n\nBlockchain TX: ${data.blockchain_tx || 'Processing...'}\n\nKegs have been added to your inventory.`);
      
      // Refresh deliveries list
      await fetchPendingDeliveries();
      
      // Notify parent component
      onDeliveryAccepted?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to accept delivery');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (deliveryId: string) => {
    const reason = prompt('Why are you rejecting this delivery?');
    if (!reason) return;

    setProcessingId(deliveryId);
    setError(null);

    try {
      const response = await fetch(`/api/deliveries/${deliveryId}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to reject delivery');
      }

      alert('❌ Delivery rejected. Driver has been notified.');
      
      // Refresh deliveries list
      await fetchPendingDeliveries();
      
      onDeliveryAccepted?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reject delivery');
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <LoadingSpinner size="md" message="Loading deliveries..." />
      </div>
    );
  }

  if (error && deliveries.length === 0) {
    return <ErrorMessage message={error} onRetry={fetchPendingDeliveries} />;
  }

  if (deliveries.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6 text-center text-gray-600">
        <div className="text-4xl mb-2">📦</div>
        <p>No pending deliveries</p>
        <p className="text-sm mt-2">Deliveries will appear here when a driver arrives</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}
      
      {deliveries.map((delivery) => (
        <div
          key={delivery.id}
          className="bg-white rounded-lg shadow-lg border-2 border-blue-200 overflow-hidden animate-pulse-slow"
        >
          {/* Header */}
          <div className="bg-blue-50 px-6 py-4 border-b border-blue-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="text-3xl">🚚</div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    Delivery Arrived
                  </h3>
                  <p className="text-sm text-gray-600">
                    from {delivery.brewery?.name || 'Unknown Brewery'}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-blue-600">
                  {delivery.keg_ids.length} {delivery.keg_ids.length === 1 ? 'Keg' : 'Kegs'}
                </div>
                <div className="text-xs text-gray-500">
                  {new Date(delivery.created_at).toLocaleTimeString()}
                </div>
              </div>
            </div>
          </div>

          {/* Keg Details */}
          <div className="px-6 py-4">
            <div className="space-y-2">
              {delivery.delivery_items && delivery.delivery_items.length > 0 ? (
                delivery.delivery_items.map((item, index) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between py-2 border-b last:border-b-0"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-sm">
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{item.keg_name}</div>
                        <div className="text-sm text-gray-600">
                          {item.keg_type} • {item.keg_size}
                        </div>
                      </div>
                    </div>
                    <div className="text-sm font-medium text-gray-700">
                      ${item.deposit_value.toFixed(2)} deposit
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-sm text-gray-600">
                  {delivery.keg_ids.length} keg(s) • Details loading...
                </div>
              )}
            </div>

            {/* Total */}
            {delivery.deposit_amount && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-gray-900">Total Deposit:</span>
                  <span className="text-xl font-bold text-blue-600">
                    ${delivery.deposit_amount.toFixed(2)}
                  </span>
                </div>
              </div>
            )}

            {/* Notes */}
            {delivery.notes && (
              <div className="mt-4 p-3 bg-gray-50 rounded-lg text-sm text-gray-700">
                <span className="font-medium">Note:</span> {delivery.notes}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex gap-3">
            <button
              onClick={() => handleAccept(delivery.id)}
              disabled={processingId === delivery.id}
              className="flex-1 bg-green-600 text-white py-4 px-6 rounded-lg hover:bg-green-700 transition-colors font-bold text-lg disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {processingId === delivery.id ? (
                <>
                  <LoadingSpinner size="sm" />
                  <span>Signing...</span>
                </>
              ) : (
                <>
                  <span>✓</span>
                  <span>Accept & Sign</span>
                </>
              )}
            </button>
            <button
              onClick={() => handleReject(delivery.id)}
              disabled={processingId === delivery.id}
              className="px-6 py-4 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Reject
            </button>
          </div>

          {/* Blockchain Info */}
          <div className="px-6 py-3 bg-blue-900 text-blue-100 text-xs">
            <div className="flex items-center gap-2">
              <span>🔒</span>
              <span>
                Accepting will create an immutable blockchain receipt and transfer keg ownership
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

