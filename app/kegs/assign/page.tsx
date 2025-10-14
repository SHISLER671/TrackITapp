'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ProtectedRoute, useAuth } from '@/components/AuthProvider';
import NavBar from '@/components/NavBar';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorMessage from '@/components/ErrorMessage';
import { Keg } from '@/lib/types';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function AssignKegsPage() {
  return (
    <ProtectedRoute allowedRoles={['BREWER']}>
      <AssignKegsContent />
    </ProtectedRoute>
  );
}

interface Driver {
  id: string;
  user_id: string;
  role: string;
}

function AssignKegsContent() {
  const router = useRouter();
  const { userRole } = useAuth();
  const [kegs, setKegs] = useState<Keg[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [selectedKegs, setSelectedKegs] = useState<string[]>([]);
  const [selectedDriver, setSelectedDriver] = useState('');
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch unassigned kegs (no current holder or holder is brewery)
      const { data: kegsData, error: kegsError } = await supabase
        .from('kegs')
        .select('*')
        .eq('is_empty', false)
        .order('created_at', { ascending: false });
      
      if (kegsError) throw kegsError;
      
      // Fetch drivers
      const { data: driversData, error: driversError } = await supabase
        .from('user_roles')
        .select('id, user_id, role')
        .eq('role', 'DRIVER');
      
      if (driversError) throw driversError;
      
      setKegs(kegsData || []);
      setDrivers(driversData || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleKegToggle = (kegId: string) => {
    setSelectedKegs((prev) =>
      prev.includes(kegId)
        ? prev.filter((id) => id !== kegId)
        : [...prev, kegId]
    );
  };

  const handleSelectAll = () => {
    if (selectedKegs.length === kegs.length) {
      setSelectedKegs([]);
    } else {
      setSelectedKegs(kegs.map((k) => k.id));
    }
  };

  const handleAssign = async () => {
    if (selectedKegs.length === 0) {
      alert('Please select at least one keg');
      return;
    }
    
    if (!selectedDriver) {
      alert('Please select a driver');
      return;
    }

    setAssigning(true);
    setError(null);

    try {
      // Update kegs to assign them to the driver
      const { error } = await supabase
        .from('kegs')
        .update({ current_holder: selectedDriver })
        .in('id', selectedKegs);

      if (error) throw error;

      alert(`✅ Successfully assigned ${selectedKegs.length} keg(s) to driver!`);
      
      // Refresh data
      await fetchData();
      setSelectedKegs([]);
      setSelectedDriver('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to assign kegs');
    } finally {
      setAssigning(false);
    }
  };

  const selectedDriverInfo = drivers.find(d => d.id === selectedDriver);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavBar />
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" message="Loading kegs and drivers..." />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Assign Kegs to Drivers</h1>
              <p className="text-gray-600 mt-2">
                Select kegs and assign them to drivers for delivery
              </p>
            </div>
            <button
              onClick={() => router.back()}
              className="text-blue-600 hover:underline"
            >
              ← Back to Dashboard
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6">
            <ErrorMessage message={error} onRetry={fetchData} />
          </div>
        )}

        {kegs.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center text-gray-600">
            <div className="text-4xl mb-2">🍺</div>
            <p>No kegs available for assignment</p>
            <p className="text-sm mt-2">Create some kegs first</p>
            <Link
              href="/kegs/new"
              className="inline-block mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Create New Keg
            </Link>
          </div>
        ) : drivers.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center text-gray-600">
            <div className="text-4xl mb-2">🚚</div>
            <p>No drivers available</p>
            <p className="text-sm mt-2">Add drivers to your brewery first</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Keg Selection */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  Select Kegs ({selectedKegs.length}/{kegs.length})
                </h2>
                <button
                  onClick={handleSelectAll}
                  className="text-sm text-blue-600 hover:underline"
                >
                  {selectedKegs.length === kegs.length ? 'Deselect All' : 'Select All'}
                </button>
              </div>

              <div className="space-y-2 max-h-96 overflow-y-auto">
                {kegs.map((keg) => {
                  const isSelected = selectedKegs.includes(keg.id);
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
                            <div className="text-sm text-gray-500">
                              {new Date(keg.created_at).toLocaleDateString()}
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
            </div>

            {/* Driver Selection */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Select Driver
              </h2>

              <div className="space-y-3">
                {drivers.map((driver) => (
                  <div
                    key={driver.id}
                    onClick={() => setSelectedDriver(driver.id)}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                      selectedDriver === driver.id
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center">
                      <input
                        type="radio"
                        checked={selectedDriver === driver.id}
                        onChange={() => setSelectedDriver(driver.id)}
                        className="h-5 w-5 text-green-600"
                      />
                      <div className="ml-4">
                        <div className="font-medium text-gray-900">
                          Driver {driver.id.substring(0, 8)}
                        </div>
                        <div className="text-sm text-gray-600">
                          ID: {driver.user_id.substring(0, 12)}...
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Assignment Summary */}
              {selectedKegs.length > 0 && selectedDriver && (
                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h3 className="font-medium text-blue-900 mb-2">Assignment Summary</h3>
                  <div className="text-sm text-blue-700">
                    <div>• {selectedKegs.length} keg(s) selected</div>
                    <div>• Driver: {selectedDriverInfo ? `Driver ${selectedDriverInfo.id.substring(0, 8)}` : 'Unknown'}</div>
                    <div>• Ready to assign</div>
                  </div>
                </div>
              )}

              {/* Assign Button */}
              <div className="mt-6">
                <button
                  onClick={handleAssign}
                  disabled={assigning || selectedKegs.length === 0 || !selectedDriver}
                  className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors font-medium disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {assigning ? (
                    <>
                      <LoadingSpinner size="sm" />
                      <span>Assigning...</span>
                    </>
                  ) : (
                    <>
                      <span>📦</span>
                      <span>
                        Assign {selectedKegs.length} Keg{selectedKegs.length !== 1 ? 's' : ''}
                      </span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
