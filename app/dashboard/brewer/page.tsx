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

export default function BrewerDashboard() {
  return (
    <ProtectedRoute allowedRoles={['BREWER']}>
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

  const activeKegs = kegs.filter((k) => !k.is_empty);
  const retiredKegs = kegs.filter((k) => k.is_empty);
  const problemKegs = kegs.filter(
    (k) =>
      !k.is_empty &&
      (!k.last_scan ||
        new Date().getTime() - new Date(k.last_scan).getTime() >
          14 * 24 * 60 * 60 * 1000)
  );
  const varianceAlerts = retiredKegs.filter(
    (k) => k.variance_status !== 'NORMAL'
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Brewer Dashboard
          </h1>
          <p className="text-gray-600 mt-2">
            Manage all your brewery kegs and track inventory
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600">Total Kegs</div>
            <div className="text-3xl font-bold text-gray-900 mt-2">
              {kegs.length}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600">Active Kegs</div>
            <div className="text-3xl font-bold text-green-600 mt-2">
              {activeKegs.length}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600">Problem Kegs</div>
            <div className="text-3xl font-bold text-yellow-600 mt-2">
              {problemKegs.length}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600">Variance Alerts</div>
            <div className="text-3xl font-bold text-red-600 mt-2">
              {varianceAlerts.length}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              href="/kegs/new"
              className="bg-blue-600 text-white p-6 rounded-lg hover:bg-blue-700 transition-colors text-center font-medium"
            >
              + Create New Keg
            </Link>
            <Link
              href="/scan"
              className="bg-gray-700 text-white p-6 rounded-lg hover:bg-gray-800 transition-colors text-center font-medium"
            >
              📷 Scan Keg QR Code
            </Link>
            <Link
              href="/reports"
              className="bg-purple-600 text-white p-6 rounded-lg hover:bg-purple-700 transition-colors text-center font-medium"
            >
              📊 View Reports
            </Link>
          </div>
        </div>

        {/* Problem Kegs */}
        {problemKegs.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              ⚠️ Problem Kegs
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {problemKegs.map((keg) => (
                <KegCard
                  key={keg.id}
                  keg={keg}
                  onClick={() => router.push(`/kegs/${keg.id}`)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Active Kegs */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Active Kegs ({activeKegs.length})
          </h2>
          {loading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="lg" message="Loading kegs..." />
            </div>
          ) : error ? (
            <ErrorMessage message={error} onRetry={fetchKegs} />
          ) : activeKegs.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center text-gray-600">
              No active kegs. Create your first keg to get started!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeKegs.map((keg) => (
                <KegCard
                  key={keg.id}
                  keg={keg}
                  showProgress
                  onClick={() => router.push(`/kegs/${keg.id}`)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Retired Kegs with Variance */}
        {varianceAlerts.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              🚨 Variance Alerts
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {varianceAlerts.map((keg) => (
                <KegCard
                  key={keg.id}
                  keg={keg}
                  showVariance
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

