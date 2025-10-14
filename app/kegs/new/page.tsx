'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ProtectedRoute, useAuth } from '@/components/AuthProvider';
import NavBar from '@/components/NavBar';
import ErrorMessage from '@/components/ErrorMessage';
import QRCodeDisplay from '@/components/QRCodeDisplay';
import { CreateKegFormData, KegSize } from '@/lib/types';
import { BEER_STYLES, KEG_SIZES } from '@/lib/constants';
import { getContractAddress } from '@/lib/thirdweb';

export default function NewKegPage() {
  return (
    <ProtectedRoute allowedRoles={['BREWER']}>
      <NewKegContent />
    </ProtectedRoute>
  );
}

function NewKegContent() {
  const router = useRouter();
  const { userRole } = useAuth();
  const [formData, setFormData] = useState<CreateKegFormData>({
    name: '',
    type: 'IPA',
    abv: 5.0,
    ibu: 40,
    brew_date: new Date().toISOString().split('T')[0],
    keg_size: '1/6BBL',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdKeg, setCreatedKeg] = useState<{ id: string; name: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/kegs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          brewery_id: userRole?.brewery_id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create keg');
      }

      setCreatedKeg({ id: data.keg.id, name: data.keg.name });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create keg');
    } finally {
      setLoading(false);
    }
  };

  if (createdKeg) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavBar />
        <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="text-green-600 text-6xl mb-4">✓</div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Keg Created Successfully!
            </h1>
            <p className="text-gray-600 mb-8">
              Your keg <span className="font-semibold">{createdKeg.name}</span> has been created.
            </p>

            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                QR Code
              </h2>
              <p className="text-sm text-gray-600 mb-4">
                Download and print this QR code to attach to your physical keg
              </p>
              <QRCodeDisplay
                contractAddress={getContractAddress()}
                tokenId={createdKeg.id}
                kegName={createdKeg.name}
              />
            </div>

            <div className="flex gap-4 justify-center">
              <button
                onClick={() => router.push(`/kegs/${createdKeg.id}`)}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                View Keg Details
              </button>
              <button
                onClick={() => {
                  setCreatedKeg(null);
                  setFormData({
                    name: '',
                    type: 'IPA',
                    abv: 5.0,
                    ibu: 40,
                    brew_date: new Date().toISOString().split('T')[0],
                    keg_size: '1/6BBL',
                  });
                }}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                Create Another Keg
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />
      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Create New Keg</h1>
          <p className="text-gray-600 mt-2">
            Enter the details of your new keg. A QR code will be generated for tracking.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && <ErrorMessage message={error} onRetry={() => setError(null)} />}

            {/* Beer Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Beer Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                maxLength={50}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Hazy IPA"
              />
            </div>

            {/* Beer Style */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Beer Style *
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {BEER_STYLES.map((style) => (
                  <option key={style} value={style}>
                    {style}
                  </option>
                ))}
              </select>
            </div>

            {/* ABV and IBU */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ABV (%) *
                </label>
                <input
                  type="number"
                  value={formData.abv}
                  onChange={(e) => setFormData({ ...formData, abv: parseFloat(e.target.value) })}
                  required
                  min={0}
                  max={20}
                  step={0.1}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  IBU *
                </label>
                <input
                  type="number"
                  value={formData.ibu}
                  onChange={(e) => setFormData({ ...formData, ibu: parseInt(e.target.value) })}
                  required
                  min={1}
                  max={120}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Brew Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Brew Date *
              </label>
              <input
                type="date"
                value={formData.brew_date}
                onChange={(e) => setFormData({ ...formData, brew_date: e.target.value })}
                required
                max={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Keg Size */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Keg Size *
              </label>
              <select
                value={formData.keg_size}
                onChange={(e) => setFormData({ ...formData, keg_size: e.target.value as KegSize })}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {KEG_SIZES.map((kegSize) => (
                  <option key={kegSize.size} value={kegSize.size}>
                    {kegSize.size} - {kegSize.name} ({kegSize.expected_pints} pints) - {kegSize.description}
                  </option>
                ))}
              </select>
              <p className="mt-2 text-sm text-gray-500">
                Expected pints will be automatically calculated based on keg size
              </p>
            </div>

            {/* Submit Button */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating Keg...' : 'Create Keg'}
              </button>
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

