'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';

export default function Home() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) {
      router.push('/dashboard');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl">Loading...</div>
      </div>
    );
  }

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-neutral-900 via-black to-neutral-900" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center animate-fade-in">
            <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-accentPrimary via-yellow-100 to-accentSecondary bg-clip-text text-transparent">
              Trade Smarter, Trade Faster
            </h1>
            <p className="text-xl text-textSecondary mb-8 max-w-2xl mx-auto">
              Experience next-generation trading with real-time data, AI-powered insights,
              and a vibrant community of traders.
            </p>

            <div className="flex gap-4 justify-center">
              <Link href="/auth/register" className="btn-primary">
                Get Started
              </Link>
              <Link href="/auth/login" className="btn-secondary">
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <h2 className="text-4xl font-bold text-center mb-16">
          Why Choose Our Platform?
        </h2>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="card hover:shadow-accentPrimary/20 transition-all duration-300 animate-slide-up">
            <div className="text-accentPrimary text-4xl mb-4">📊</div>
            <h3 className="text-2xl font-semibold mb-3">Multi-Asset Trading</h3>
            <p className="text-textSecondary">
              Trade stocks and options with advanced tools and real-time market data.
            </p>
          </div>

          <div className="card hover:shadow-accentPrimary/20 transition-all duration-300 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <div className="text-accentPrimary text-4xl mb-4">💰</div>
            <h3 className="text-2xl font-semibold mb-3">Paper Trading</h3>
            <p className="text-textSecondary">
              Practice with $100K virtual funds. Learn without risk before going live.
            </p>
          </div>

          <div className="card hover:shadow-accentPrimary/20 transition-all duration-300 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <div className="text-accentPrimary text-4xl mb-4">🤖</div>
            <h3 className="text-2xl font-semibold mb-3">AI-Powered Insights</h3>
            <p className="text-textSecondary">
              Get intelligent analysis, strategy suggestions, and portfolio insights.
            </p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-accentPrimary/10 to-accentSecondary/10 py-16">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Trading?</h2>
          <p className="text-textSecondary mb-8">
            Join thousands of traders already using our platform
          </p>
          <Link href="/auth/register" className="btn-primary">
            Create Free Account
          </Link>
        </div>
      </div>
    </main>
  );
}
