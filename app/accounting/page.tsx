'use client';

import React, { useEffect, useState } from 'react';
import { ProtectedRoute } from '@/components/AuthProvider';
import NavBar from '@/components/NavBar';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorMessage from '@/components/ErrorMessage';
import { Delivery } from '@/lib/types';

export default function AccountingPage() {
  return (
    <ProtectedRoute allowedRoles={['RESTAURANT_MANAGER', 'BREWER']}>
      <AccountingContent />
    </ProtectedRoute>
  );
}

interface DeliveryWithDetails extends Delivery {
  brewery?: { name: string };
  delivery_items?: any[];
}

function AccountingContent() {
  const [deliveries, setDeliveries] = useState<DeliveryWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  
  // Filters
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'accepted' | 'pending'>('accepted');

  useEffect(() => {
    fetchDeliveries();
  }, [statusFilter]);

  const fetchDeliveries = async () => {
    try {
      setLoading(true);
      
      let url = '/api/deliveries';
      if (statusFilter !== 'all') {
        url += `?status=${statusFilter}`;
      }
      
      const response = await fetch(url);
      
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

  const handleExportCSV = async () => {
    setExporting(true);
    
    try {
      // Filter deliveries by date range if specified
      let filteredDeliveries = deliveries.filter(d => d.status === 'ACCEPTED');
      
      if (startDate) {
        filteredDeliveries = filteredDeliveries.filter(
          d => new Date(d.accepted_at || d.created_at) >= new Date(startDate)
        );
      }
      
      if (endDate) {
        filteredDeliveries = filteredDeliveries.filter(
          d => new Date(d.accepted_at || d.created_at) <= new Date(endDate)
        );
      }
      
      // Generate CSV
      const headers = [
        'Receipt #',
        'Date',
        'Time',
        'Brewery',
        'Restaurant ID',
        'Total Kegs',
        'Total Deposit',
        'Blockchain TX Hash',
        'Blockchain Explorer',
      ];
      
      const rows = filteredDeliveries.map(delivery => {
        const acceptedDate = new Date(delivery.accepted_at || delivery.created_at);
        const receiptNumber = `RCP-${delivery.id.substring(0, 8).toUpperCase()}`;
        const explorerUrl = delivery.blockchain_tx_hash
          ? `https://basescan.org/tx/${delivery.blockchain_tx_hash}`
          : '';
        
        return [
          receiptNumber,
          acceptedDate.toLocaleDateString(),
          acceptedDate.toLocaleTimeString(),
          delivery.brewery?.name || 'Unknown',
          delivery.restaurant_id.substring(0, 8),
          delivery.keg_ids.length.toString(),
          (delivery.deposit_amount || 0).toFixed(2),
          delivery.blockchain_tx_hash || 'Pending',
          explorerUrl,
        ];
      });
      
      // Create CSV content
      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
      ].join('\n');
      
      // Download file
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `keg-deliveries-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      alert('✅ CSV exported successfully!');
    } catch (err) {
      alert('❌ Failed to export CSV: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setExporting(false);
    }
  };

  const acceptedDeliveries = deliveries.filter(d => d.status === 'ACCEPTED');
  const totalKegs = acceptedDeliveries.reduce((sum, d) => sum + d.keg_ids.length, 0);
  const totalDeposit = acceptedDeliveries.reduce((sum, d) => sum + (d.deposit_amount || 0), 0);

  // Apply date filters for display
  let filteredForDisplay = acceptedDeliveries;
  if (startDate) {
    filteredForDisplay = filteredForDisplay.filter(
      d => new Date(d.accepted_at || d.created_at) >= new Date(startDate)
    );
  }
  if (endDate) {
    filteredForDisplay = filteredForDisplay.filter(
      d => new Date(d.accepted_at || d.created_at) <= new Date(endDate)
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Accounting & Reconciliation</h1>
          <p className="text-gray-600 mt-2">
            Track deliveries, deposits, and export for bookkeeping
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600">Total Deliveries</div>
            <div className="text-3xl font-bold text-blue-600 mt-2">
              {acceptedDeliveries.length}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600">Total Kegs Received</div>
            <div className="text-3xl font-bold text-green-600 mt-2">{totalKegs}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600">Total Deposits</div>
            <div className="text-3xl font-bold text-purple-600 mt-2">
              ${totalDeposit.toFixed(2)}
            </div>
          </div>
        </div>

        {/* Filters & Export */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status Filter
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="accepted">Accepted Only</option>
                <option value="pending">Pending</option>
                <option value="all">All</option>
              </select>
            </div>
            <button
              onClick={handleExportCSV}
              disabled={exporting || acceptedDeliveries.length === 0}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {exporting ? (
                <>
                  <LoadingSpinner size="sm" />
                  <span>Exporting...</span>
                </>
              ) : (
                <>
                  <span>📊</span>
                  <span>Export CSV</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Deliveries Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-900">
              Delivery History
              {(startDate || endDate) && (
                <span className="ml-2 text-sm font-normal text-gray-600">
                  ({filteredForDisplay.length} filtered)
                </span>
              )}
            </h2>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="lg" message="Loading deliveries..." />
            </div>
          ) : error ? (
            <div className="p-6">
              <ErrorMessage message={error} onRetry={fetchDeliveries} />
            </div>
          ) : filteredForDisplay.length === 0 ? (
            <div className="p-12 text-center text-gray-600">
              <div className="text-4xl mb-2">📦</div>
              <p>No deliveries found</p>
              {(startDate || endDate) && (
                <button
                  onClick={() => {
                    setStartDate('');
                    setEndDate('');
                  }}
                  className="mt-4 text-blue-600 underline"
                >
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Brewery
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Kegs
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Deposit
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Blockchain
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredForDisplay.map((delivery) => {
                    const date = new Date(delivery.accepted_at || delivery.created_at);
                    return (
                      <tr key={delivery.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div>{date.toLocaleDateString()}</div>
                          <div className="text-xs text-gray-500">
                            {date.toLocaleTimeString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {delivery.brewery?.name || 'Unknown'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {delivery.keg_ids.length}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          ${(delivery.deposit_amount || 0).toFixed(2)}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          {delivery.blockchain_tx_hash ? (
                            <a
                              href={`https://basescan.org/tx/${delivery.blockchain_tx_hash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline flex items-center gap-1"
                            >
                              <span>🔗</span>
                              <span className="max-w-[100px] truncate">
                                {delivery.blockchain_tx_hash}
                              </span>
                            </a>
                          ) : (
                            <span className="text-gray-400">Pending</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <a
                            href={`/api/deliveries/${delivery.id}/receipt?format=html`}
                            target="_blank"
                            className="text-blue-600 hover:underline"
                          >
                            View Receipt
                          </a>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

