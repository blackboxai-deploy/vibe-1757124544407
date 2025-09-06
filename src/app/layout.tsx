import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Loan Calculator Pro',
  description: 'Advanced loan calculator with payment tracking, amortization schedules, and comprehensive loan management features.',
  keywords: 'loan calculator, mortgage calculator, payment tracker, amortization schedule',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
          <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
            <div className="container mx-auto px-4 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">LC</span>
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-slate-900">Loan Calculator Pro</h1>
                    <p className="text-xs text-slate-600">Advanced Payment Tracking</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2 text-sm text-slate-600">
                  <span className="hidden md:inline">Professional Loan Management</span>
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                </div>
              </div>
            </div>
          </header>
          <main className="container mx-auto px-4 py-6">
            {children}
          </main>
          <footer className="border-t bg-white/50 mt-12">
            <div className="container mx-auto px-4 py-6">
              <div className="text-center text-sm text-slate-600">
                <p>© 2024 Loan Calculator Pro. Built for accurate financial planning.</p>
                <p className="mt-1 text-xs">Calculate payments • Track progress • Plan ahead</p>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}