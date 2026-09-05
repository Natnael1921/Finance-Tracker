import { useState } from 'react';
import { Menu, TrendingUp } from 'lucide-react';
import Sidebar from './Sidebar';

export default function Layout({ children }) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-base-950">
      {/* Sidebar renders desktop sidebar + mobile drawer + bottom tab bar */}
      <Sidebar drawerOpen={drawerOpen} setDrawerOpen={setDrawerOpen} />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile top header */}
        <header className="lg:hidden sticky top-0 z-20 flex items-center justify-between px-4 py-3 bg-base-950/90 backdrop-blur-md border-b border-base-800">
          <button
            onClick={() => setDrawerOpen(true)}
            className="btn-ghost p-2 -ml-2"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-accent-500 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-black" />
            </div>
            <span className="font-bold text-base-50 text-sm">Finance Tracker</span>
          </div>
          <div className="w-9" /> {/* spacer */}
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 sm:py-8 page-enter pb-24 lg:pb-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
