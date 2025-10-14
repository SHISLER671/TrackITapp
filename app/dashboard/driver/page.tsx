'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/AuthProvider';
import NavBar from '@/components/NavBar';
import KegCard from '@/components/KegCard';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorMessage from '@/components/ErrorMessage';
import { Keg } from '@/lib/types';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function DriverDashboard() {
  return (
    <ProtectedRoute allowedRoles={['DRIVER']}>
      <DashboardContent />
    </ProtectedRoute>
  );
}

function DashboardContent() {
  const router = useRouter();
  const [kegs, setKegs] = useState<Keg[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchKegs();
  }, []);

  const fetchKegs = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('kegs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setKegs(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch kegs');
    } finally {
      setLoading(false);
    }
  };

  const scannedKegs = kegs.filter((k) => k.last_scan);
  const unscannedKegs = kegs.filter((k) => !k.last_scan);
  const completionRate = kegs.length > 0 
    ? Math.round((scannedKegs.length / kegs.length) * 100) 
    : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Driver Dashboard</h1>
          <p className="text-gray-600 mt-2">Track your delivery route kegs</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600">Total Kegs</div>
            <div className="text-3xl font-bold text-gray-900 mt-2">{kegs.length}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600">Scanned</div>
            <div className="text-3xl font-bold text-green-600 mt-2">{scannedKegs.length}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600">Remaining</div>
            <div className="text-3xl font-bold text-orange-600 mt-2">{unscannedKegs.length}</div>
          </div>
        </div>

        {/* Route Progress */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-semibold text-gray-900">Route Completion</h2>
            <span className="text-2xl font-bold text-blue-600">{completionRate}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
            <div
              className="bg-blue-600 h-full transition-all duration-300"
              style={{ width: `${completionRate}%` }}
            />
          </div>
        </div>

        {/* Quick Action */}
        <div className="mb-8">
          <Link
            href="/scan"
            className="block bg-blue-600 text-white p-6 rounded-lg hover:bg-blue-700 transition-colors text-center font-medium text-xl"
          >
            📷 Scan Keg
          </Link>
        </div>

        {/* Unscanned Kegs */}
        {unscannedKegs.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              ⚠️ Kegs to Scan ({unscannedKegs.length})
            </h2>
            {loading ? (
              <div className="flex justify-center py-12">
                <LoadingSpinner size="lg" message="Loading kegs..." />
              </div>
            ) : error ? (
              <ErrorMessage message={error} onRetry={fetchKegs} />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {unscannedKegs.map((keg) => (
                  <KegCard
                    key={keg.id}
                    keg={keg}
                    onClick={() => router.push('/scan')}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Scanned Kegs */}
        {scannedKegs.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              ✓ Scanned Kegs ({scannedKegs.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {scannedKegs.map((keg) => (
                <KegCard
                  key={keg.id}
                  keg={keg}
                  onClick={() => router.push(`/kegs/${keg.id}`)}
                />
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

