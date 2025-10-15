'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from './AuthProvider';
import { usePathname } from 'next/navigation';

export default function NavBar() {
  const { user, userRole, signOut } = useAuth();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (!user || !userRole) {
    return null;
  }

  // Role-specific navigation
  const getNavLinks = () => {
    const role = userRole.role;

    if (role === 'BREWER') {
      return [
        { href: '/dashboard/brewer', label: 'Dashboard' },
        { href: '/kegs/new', label: 'New Keg' },
        { href: '/kegs/batch', label: 'Batch' },
        { href: '/accounting', label: 'Accounting' },
        { href: '/reports', label: 'Reports' },
        { href: '/scan', label: 'Scan' },
      ];
    }

    if (role === 'DRIVER') {
      return [
        { href: '/dashboard/driver', label: 'Dashboard' },
        { href: '/scan', label: 'Scan' },
        { href: '/deliveries/new', label: 'Create Delivery' },
      ];
    }

    if (role === 'RESTAURANT_MANAGER') {
      return [
        { href: '/dashboard/restaurant', label: 'Dashboard' },
        { href: '/scan', label: 'Scan' },
        { href: '/accounting', label: 'Accounting' },
        { href: '/reports', label: 'Reports' },
      ];
    }

    return [];
  };

  const navLinks = getNavLinks();

  const handleSignOut = async () => {
    await signOut();
    window.location.href = '/auth/login';
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <span className="text-2xl font-bold text-blue-600">
                🍺 Keg Tracker
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  pathname === link.href
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {link.label}
              </Link>
            ))}

            {/* User Menu */}
            <div className="ml-4 flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {userRole.role.replace('_', ' ')}
              </span>
              <button
                onClick={handleSignOut}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:bg-gray-100"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {mobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  pathname === link.href
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="px-3 py-2">
              <span className="text-sm text-gray-600 block mb-2">
                {userRole.role.replace('_', ' ')}
              </span>
              <button
                onClick={handleSignOut}
                className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
