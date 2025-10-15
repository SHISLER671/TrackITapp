'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ProtectedRoute, useAuth } from '@/components/AuthProvider';
import NavBar from '@/components/NavBar';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorMessage from '@/components/ErrorMessage';
import { CreateKegFormData, KegSize, BeerStyle } from '@/lib/types';
import { BEER_STYLES, KEG_SIZES } from '@/lib/constants';

export default function BatchKegPage() {
  return (
    <ProtectedRoute allowedRoles={['BREWER']}>
      <BatchKegContent />
    </ProtectedRoute>
  );
}

function BatchKegContent() {
  const router = useRouter();
  const { userRole } = useAuth();
  const [baseForm, setBaseForm] = useState<CreateKegFormData>({
    name: '',
    type: 'IPA',
    abv: 5.0,
    ibu: 40,
    brew_date: new Date().toISOString().split('T')[0],
    keg_size: '1/6BBL',
  });
  const [kegCount, setKegCount] = useState(3);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdKegs, setCreatedKegs] = useState<{ id: string; name: string }[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const createdKegsList: { id: string; name: string }[] = [];

      // Create multiple kegs with the same base data
      for (let i = 1; i <= kegCount; i++) {
        const kegData = {
          ...baseForm,
          name: kegCount > 1 ? `${baseForm.name} #${i}` : baseForm.name,
          brewery_id: userRole?.brewery_id,
        };

        const response = await fetch('/api/kegs', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(kegData),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || `Failed to create keg ${i}`);
        }

        createdKegsList.push({ id: data.keg.id, name: data.keg.name });
      }

      setCreatedKegs(createdKegsList);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create kegs');
    } finally {
      setLoading(false);
    }
  };

  if (createdKegs.length > 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavBar />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="text-green-600 text-6xl mb-4">✓</div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Batch Creation Successful!
            </h1>
            <p className="text-gray-600 mb-8">
              Created {createdKegs.length} kegs successfully
            </p>

            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Created Kegs
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {createdKegs.map((keg, index) => (
                  <div
                    key={keg.id}
                    className="bg-blue-50 border border-blue-200 rounded-lg p-4"
                  >
                    <div className="font-medium text-blue-900">{keg.name}</div>
                    <div className="text-sm text-blue-600">ID: {keg.id.substring(0, 8)}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-4 justify-center">
              <button
                onClick={() => router.push('/dashboard/brewer')}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Back to Dashboard
              </button>
              <button
                onClick={() => {
                  setCreatedKegs([]);
                  setBaseForm({
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
                Create Another Batch
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
          <h1 className="text-3xl font-bold text-gray-900">Batch Create Kegs</h1>
          <p className="text-gray-600 mt-2">
            Create multiple kegs with similar details. Perfect for batch brewing!
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && <ErrorMessage message={error} onRetry={() => setError(null)} />}

            {/* Keg Count */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Number of Kegs *
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="2"
                  max="10"
                  value={kegCount}
                  onChange={(e) => setKegCount(parseInt(e.target.value))}
                  className="flex-1"
                />
                <div className="text-2xl font-bold text-blue-600 min-w-[3rem] text-center">
                  {kegCount}
                </div>
              </div>
              <p className="mt-2 text-sm text-gray-500">
                Each keg will be numbered automatically (e.g., "Hazy IPA #1", "Hazy IPA #2")
              </p>
            </div>

            {/* Beer Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Beer Name (Base) *
              </label>
              <input
                type="text"
                value={baseForm.name}
                onChange={(e) => setBaseForm({ ...baseForm, name: e.target.value })}
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
                value={baseForm.type}
                onChange={(e) => setBaseForm({ ...baseForm, type: e.target.value as BeerStyle })}
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

            {/* ABV and IBU with sliders */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ABV (%) *
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="0"
                    max="20"
                    step="0.1"
                    value={baseForm.abv}
                    onChange={(e) => setBaseForm({ ...baseForm, abv: parseFloat(e.target.value) })}
                    className="flex-1"
                  />
                  <div className="text-lg font-bold text-blue-600 min-w-[4rem] text-center">
                    {baseForm.abv.toFixed(1)}%
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  IBU *
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="1"
                    max="120"
                    value={baseForm.ibu}
                    onChange={(e) => setBaseForm({ ...baseForm, ibu: parseInt(e.target.value) })}
                    className="flex-1"
                  />
                  <div className="text-lg font-bold text-blue-600 min-w-[3rem] text-center">
                    {baseForm.ibu}
                  </div>
                </div>
              </div>
            </div>

            {/* Brew Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Brew Date *
              </label>
              <input
                type="date"
                value={baseForm.brew_date}
                onChange={(e) => setBaseForm({ ...baseForm, brew_date: e.target.value })}
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
                value={baseForm.keg_size}
                onChange={(e) => setBaseForm({ ...baseForm, keg_size: e.target.value as KegSize })}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {KEG_SIZES.map((kegSize) => (
                  <option key={kegSize.size} value={kegSize.size}>
                    {kegSize.size} - {kegSize.name} ({kegSize.expected_pints} pints)
                  </option>
                ))}
              </select>
            </div>

            {/* Preview */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-medium text-blue-900 mb-2">Preview:</h3>
              <div className="text-sm text-blue-700">
                {kegCount > 1 ? (
                  <div>
                    Will create {kegCount} kegs:
                    <ul className="mt-1 list-disc list-inside">
                      {Array.from({ length: Math.min(kegCount, 5) }, (_, i) => (
                        <li key={i}>{baseForm.name} #{i + 1}</li>
                      ))}
                      {kegCount > 5 && <li>...and {kegCount - 5} more</li>}
                    </ul>
                  </div>
                ) : (
                  <div>Will create 1 keg: {baseForm.name}</div>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading || !baseForm.name.trim()}
                className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <LoadingSpinner size="sm" />
                    <span>Creating {kegCount} Kegs...</span>
                  </>
                ) : (
                  <>
                    <span>📦</span>
                    <span>Create {kegCount} Keg{kegCount > 1 ? 's' : ''}</span>
                  </>
                )}
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
