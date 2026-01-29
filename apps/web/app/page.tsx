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
    <main className="min-h-screen bg-[#0a1628] text-[#e2e8f0] font-sans selection:bg-accentPrimary/30">
      {/* Navigation Header */}
      <nav className="fixed top-0 w-full z-50 glass-effect border-b border-white/5 py-4">
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accentPrimary flex items-center justify-center shadow-lg shadow-accentPrimary/20">
              <span className="text-xl font-bold text-[#0a1628]">D</span>
            </div>
            <span className="text-xl font-bold tracking-tight text-white">Decyphers</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/auth/login" className="text-sm font-medium text-textSecondary hover:text-white transition-colors">Sign In</Link>
            <Link href="/auth/register" className="btn-primary py-2 px-6 text-sm shadow-xl shadow-accentPrimary/10">Get Started</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-24 overflow-hidden">
        {/* Animated Background Orbs */}
        <div className="absolute top-0 right-0 -mr-24 -mt-24 w-96 h-96 bg-accentPrimary/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-0 left-0 -ml-24 -mb-24 w-96 h-96 bg-accentSecondary/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
        
        <div className="relative max-w-7xl mx-auto px-6">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accentPrimary/10 border border-accentPrimary/20 text-accentPrimary text-xs font-bold tracking-wider mb-6">
              <span className="flex h-2 w-2 rounded-full bg-accentPrimary animate-ping" />
              NEXT-GEN TRADING
            </div>
            <h1 className="text-6xl md:text-7xl font-bold leading-[1.1] mb-8">
              Trade with <span className="gold-gradient-text">Precision</span>.<br />
              Master with AI.
            </h1>
            <p className="text-xl text-textSecondary mb-10 leading-relaxed max-w-2xl">
              Experience the ultimate trading platform where real-time analytics meets 
              AI-driven mentorship. Manage your portfolio like a pro with tools data-driven 
              for success.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/auth/register" className="btn-primary px-8 py-4 text-lg hover:scale-105 active:scale-95 transition-transform group">
                Begin Your Journey
                <svg className="inline-block ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <Link href="/auth/login" className="btn-secondary px-8 py-4 text-lg bg-white/5 border-white/10 hover:bg-white/10 transition-colors">
                View Demo
              </Link>
            </div>
            
            {/* Stats */}
            <div className="mt-16 flex gap-12 items-center">
              <div>
                <div className="text-3xl font-bold text-white mb-1">$100K</div>
                <div className="text-xs font-bold text-textSecondary tracking-widest uppercase">Virtual Funds</div>
              </div>
              <div className="w-px h-10 bg-white/10" />
              <div>
                <div className="text-3xl font-bold text-white mb-1">24/7</div>
                <div className="text-xs font-bold text-textSecondary tracking-widest uppercase">Live Data</div>
              </div>
              <div className="w-px h-10 bg-white/10" />
              <div>
                <div className="text-3xl font-bold text-white mb-1">AI</div>
                <div className="text-xs font-bold text-textSecondary tracking-widest uppercase">Expert Mentor</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-bold mb-4">Why Professional Traders Choose Decyphers</h2>
            <p className="text-textSecondary max-w-2xl mx-auto text-lg">
              Built for traders who demand more than just a table of numbers. 
              Advanced visualization and AI integration at your fingertips.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="info-card">
              <div className="w-14 h-14 rounded-2xl bg-accentPrimary/20 flex items-center justify-center text-3xl mb-6 float-icon">📊</div>
              <h3 className="text-2xl font-bold mb-4 text-white">Advanced Portfolio</h3>
              <p className="text-textSecondary leading-relaxed">
                Visualise your concentration, risk exposure, and performance across 
                Crypto, Stocks, Forex, and more with our interactive dashboard.
              </p>
            </div>

            <div className="info-card">
              <div className="w-14 h-14 rounded-2xl bg-accentSecondary/20 flex items-center justify-center text-3xl mb-6 float-icon" style={{ animationDelay: '0.5s' }}>🤖</div>
              <h3 className="text-2xl font-bold mb-4 text-white">AI Trading Mentor</h3>
              <p className="text-textSecondary leading-relaxed">
                Connect your data to our specialized AI analyst for personalized 
                strategies, threat detection, and portfolio optimization suggestions.
              </p>
            </div>

            <div className="info-card">
              <div className="w-14 h-14 rounded-2xl bg-positive/20 flex items-center justify-center text-3xl mb-6 float-icon" style={{ animationDelay: '1s' }}>📸</div>
              <h3 className="text-2xl font-bold mb-4 text-white">AI Vision Import</h3>
              <p className="text-textSecondary leading-relaxed">
                Forget manual entry. Simply snap a screenshot of your broker app 
                and let our AI extract and categorize your positions instantly.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="relative rounded-[32px] overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-accentPrimary/20 to-accentSecondary/20" />
            <div className="absolute inset-0 bg-[#0d1f3c]/40 backdrop-blur-3xl" />
            <div className="relative px-8 py-20 text-center">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">Start Refining Your Strategy Today</h2>
              <p className="text-xl text-textSecondary mb-10 max-w-2xl mx-auto">
                Join the elite circle of traders using data-driven insights to outpace the market.
                Create your free virtual account in seconds.
              </p>
              <Link href="/auth/register" className="btn-primary px-10 py-5 text-xl hover:scale-105 transition-transform inline-block">
                Get Started Now
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-textSecondary text-sm">
            © 2026 Decyphers AI. All rights reserved.
          </div>
          <div className="flex gap-8 text-sm text-textSecondary">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Security</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
