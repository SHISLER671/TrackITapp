'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/AuthProvider';
import NavBar from '@/components/NavBar';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorMessage from '@/components/ErrorMessage';
import { Delivery, DeliveryItem } from '@/lib/types';

interface Props {
  params: { id: string };
}

export default function DeliveryDetailPage({ params }: Props) {
  return (
    <ProtectedRoute>
      <DeliveryDetailContent deliveryId={params.id} />
    </ProtectedRoute>
  );
}

interface DeliveryWithDetails extends Delivery {
  delivery_items?: DeliveryItem[];
  brewery?: { name: string };
  driver?: any;
  restaurant?: any;
}

function DeliveryDetailContent({ deliveryId }: { deliveryId: string }) {
  const router = useRouter();
  const [delivery, setDelivery] = useState<DeliveryWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDelivery();
    
    // Auto-refresh if pending
    const interval = setInterval(() => {
      if (delivery?.status === 'PENDING') {
        fetchDelivery();
      }
    }, 10000);
    
    return () => clearInterval(interval);
  }, [deliveryId]);

  const fetchDelivery = async () => {
    try {
      const response = await fetch(`/api/deliveries/${deliveryId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch delivery');
      }
      
      const data = await response.json();
      setDelivery(data.delivery);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load delivery');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavBar />
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" message="Loading delivery..." />
        </div>
      </div>
    );
  }

  if (error || !delivery) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavBar />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <ErrorMessage message={error || 'Delivery not found'} onRetry={fetchDelivery} />
        </main>
      </div>
    );
  }

  const statusColors = {
    PENDING: 'bg-orange-100 text-orange-700',
    ACCEPTED: 'bg-green-100 text-green-700',
    REJECTED: 'bg-red-100 text-red-700',
    CANCELLED: 'bg-gray-100 text-gray-700',
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => router.back()}
          className="mb-6 text-blue-600 hover:underline flex items-center gap-2"
        >
          ← Back
        </button>

        <div className="mb-8">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">Delivery Details</h1>
            <span
              className={`px-4 py-2 rounded-full text-sm font-bold ${
                statusColors[delivery.status]
              }`}
            >
              {delivery.status}
            </span>
          </div>
          <p className="text-gray-600 mt-2">
            Created {new Date(delivery.created_at).toLocaleString()}
          </p>
        </div>

        {/* Status Banner */}
        {delivery.status === 'PENDING' && (
          <div className="mb-6 bg-orange-50 border-2 border-orange-200 rounded-lg p-6">
            <div className="flex items-center gap-3">
              <div className="text-3xl">⏳</div>
              <div>
                <h3 className="font-bold text-orange-900">Waiting for Manager</h3>
                <p className="text-sm text-orange-700">
                  The restaurant manager needs to accept this delivery
                </p>
              </div>
            </div>
          </div>
        )}

        {delivery.status === 'ACCEPTED' && (
          <div className="mb-6 bg-green-50 border-2 border-green-200 rounded-lg p-6">
            <div className="flex items-center gap-3">
              <div className="text-3xl">✅</div>
              <div>
                <h3 className="font-bold text-green-900">Delivery Accepted!</h3>
                <p className="text-sm text-green-700">
                  Accepted {new Date(delivery.accepted_at || '').toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Parties */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Parties</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-gray-600">From:</span>
              <span className="font-medium">{delivery.brewery?.name || 'Unknown Brewery'}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-gray-600">Driver:</span>
              <span className="font-medium">
                {delivery.driver_id.substring(0, 8)}
              </span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-600">Restaurant:</span>
              <span className="font-medium">
                {delivery.restaurant_id.substring(0, 8)}
              </span>
            </div>
          </div>
        </div>

        {/* Kegs */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Kegs ({delivery.keg_ids.length})
          </h2>
          {delivery.delivery_items && delivery.delivery_items.length > 0 ? (
            <div className="space-y-3">
              {delivery.delivery_items.map((item, index) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
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
                    ${item.deposit_value.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-gray-600">
              {delivery.keg_ids.length} keg(s) • Details loading...
            </div>
          )}

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
        </div>

        {/* Notes */}
        {delivery.notes && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Notes</h2>
            <p className="text-gray-700">{delivery.notes}</p>
          </div>
        )}

        {/* Blockchain Info */}
        {delivery.blockchain_tx_hash && (
          <div className="bg-blue-900 text-blue-100 rounded-lg p-6 mb-6">
            <h2 className="text-lg font-semibold mb-3">🔒 Blockchain Receipt</h2>
            <div className="space-y-2 text-sm">
              <div>
                <span className="opacity-75">Transaction Hash:</span>
                <div className="font-mono mt-1 break-all">
                  {delivery.blockchain_tx_hash}
                </div>
              </div>
              <a
                href={`https://basescan.org/tx/${delivery.blockchain_tx_hash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-3 text-blue-300 hover:underline"
              >
                View on Blockchain Explorer →
              </a>
            </div>
          </div>
        )}

        {/* Actions */}
        {delivery.status === 'ACCEPTED' && (
          <div className="flex gap-4">
            <a
              href={`/api/deliveries/${delivery.id}/receipt?format=html`}
              target="_blank"
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-center"
            >
              📄 View Receipt
            </a>
            <button
              onClick={() => router.push('/dashboard/driver')}
              className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
            >
              Back to Dashboard
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

