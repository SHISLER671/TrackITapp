'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ProtectedRoute, useAuth } from '@/components/AuthProvider';
import NavBar from '@/components/NavBar';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorMessage from '@/components/ErrorMessage';
import { Keg } from '@/lib/types';
import { supabase } from '@/lib/supabase';

export default function NewDeliveryPage() {
  return (
    <ProtectedRoute allowedRoles={['DRIVER']}>
      <NewDeliveryContent />
    </ProtectedRoute>
  );
}

interface Restaurant {
  id: string;
  user_id: string;
  role: string;
}

function NewDeliveryContent() {
  const router = useRouter();
  const { userRole } = useAuth();
  const [kegsOnTruck, setKegsOnTruck] = useState<Keg[]>([]);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [selectedKegIds, setSelectedKegIds] = useState<string[]>([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch kegs on driver's truck
      const { data: kegs, error: kegsError } = await supabase
        .from('kegs')
        .select('*')
        .eq('is_empty', false)
        .order('created_at', { ascending: false });
      
      if (kegsError) throw kegsError;
      
      // Fetch available restaurants
      const { data: restaurantsList, error: restaurantsError } = await supabase
        .from('user_roles')
        .select('id, user_id, role')
        .eq('role', 'RESTAURANT_MANAGER');
      
      if (restaurantsError) throw restaurantsError;
      
      setKegsOnTruck(kegs || []);
      setRestaurants(restaurantsList || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleKegToggle = (kegId: string) => {
    setSelectedKegIds((prev) =>
      prev.includes(kegId)
        ? prev.filter((id) => id !== kegId)
        : [...prev, kegId]
    );
  };

  const handleSelectAll = () => {
    if (selectedKegIds.length === kegsOnTruck.length) {
      setSelectedKegIds([]);
    } else {
      setSelectedKegIds(kegsOnTruck.map((k) => k.id));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedKegIds.length === 0) {
      alert('Please select at least one keg');
      return;
    }
    
    if (!selectedRestaurant) {
      alert('Please select a destination restaurant');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/deliveries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          restaurant_id: selectedRestaurant,
          keg_ids: selectedKegIds,
          notes: notes || undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create delivery');
      }

      const data = await response.json();
      
      alert(`✅ Delivery created!\n\n${selectedKegIds.length} kegs ready for drop-off.\n\nThe restaurant manager will be notified.`);
      
      router.push('/dashboard/driver');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create delivery');
    } finally {
      setSubmitting(false);
    }
  };

  const totalDeposit = selectedKegIds.reduce((sum, id) => {
    const keg = kegsOnTruck.find((k) => k.id === id);
    return sum + (keg ? 30 : 0); // $30 per keg
  }, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavBar />
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" message="Loading..." />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Create Delivery</h1>
          <p className="text-gray-600 mt-2">Select kegs and destination</p>
        </div>

        {error && (
          <div className="mb-6">
            <ErrorMessage message={error} onRetry={fetchData} />
          </div>
        )}

        {kegsOnTruck.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="text-4xl mb-4">🚚</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No kegs on truck
            </h3>
            <p className="text-gray-600 mb-6">
              Scan kegs to load them onto your truck first
            </p>
            <button
              onClick={() => router.push('/scan')}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Go to Scanner
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Restaurant Selection */}
            <div className="bg-white rounded-lg shadow p-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Destination Restaurant *
              </label>
              <select
                value={selectedRestaurant}
                onChange={(e) => setSelectedRestaurant(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select a restaurant...</option>
                {restaurants.map((restaurant) => (
                  <option key={restaurant.id} value={restaurant.id}>
                    Restaurant {restaurant.id.substring(0, 8)}
                  </option>
                ))}
              </select>
              <p className="mt-2 text-sm text-gray-500">
                {restaurants.length} restaurant(s) available
              </p>
            </div>

            {/* Keg Selection */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Select Kegs for Delivery *
                </label>
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="text-sm text-blue-600 hover:underline"
                >
                  {selectedKegIds.length === kegsOnTruck.length
                    ? 'Deselect All'
                    : 'Select All'}
                </button>
              </div>

              <div className="space-y-2 max-h-96 overflow-y-auto">
                {kegsOnTruck.map((keg) => {
                  const isSelected = selectedKegIds.includes(keg.id);
                  return (
                    <div
                      key={keg.id}
                      onClick={() => handleKegToggle(keg.id)}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleKegToggle(keg.id)}
                          className="h-5 w-5 text-blue-600 rounded"
                        />
                        <div className="ml-4 flex-1">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium text-gray-900">
                                {keg.name}
                              </div>
                              <div className="text-sm text-gray-600">
                                {keg.type} • {keg.keg_size}
                              </div>
                            </div>
                            <div className="text-sm font-medium text-gray-700">
                              $30 deposit
                            </div>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            ID: {keg.id.substring(0, 12)}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-900">
                    Selected: {selectedKegIds.length} keg(s)
                  </span>
                  <span className="text-lg font-bold text-blue-600">
                    Total Deposit: ${totalDeposit.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="bg-white rounded-lg shadow p-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Delivery Notes (Optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder="E.g., 'Arriving around 2 PM' or 'Call when outside'"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Submit */}
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || selectedKegIds.length === 0}
                className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-bold disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <LoadingSpinner size="sm" />
                    <span>Creating...</span>
                  </>
                ) : (
                  <>
                    <span>📦</span>
                    <span>Create Delivery</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </main>
    </div>
  );
}

