import { useState } from 'react';
import { Menu, Bell } from 'lucide-react';
import Sidebar from './Sidebar';

export default function Layout({ children }) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-base-950">
      {/* Sidebar renders desktop sidebar + mobile drawer + bottom tab bar */}
      <Sidebar drawerOpen={drawerOpen} setDrawerOpen={setDrawerOpen} />

      <div className="flex-1 flex flex-col min-w-0">
        {/* ── Mobile top header ─────────────────────────────────────────── */}
        <header
          className="lg:hidden sticky top-0 z-20 flex items-center justify-between px-4 py-2.5 backdrop-blur-xl"
          style={{
            background: 'rgba(13,13,13,0.85)',
            borderBottom: '1px solid rgba(34,197,94,0.08)',
            boxShadow: '0 1px 20px rgba(0,0,0,0.4)',
          }}
        >
          {/* Hamburger */}
          <button
            onClick={() => setDrawerOpen(true)}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-base-400 hover:text-base-100 hover:bg-base-800 transition-all"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Logo + name — centered */}
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-xl overflow-hidden shrink-0"
              style={{
                border: '1px solid rgba(34,197,94,0.3)',
                boxShadow: '0 0 12px rgba(34,197,94,0.2)',
              }}
            >
              <img src="/icon-192.png" alt="BE" className="w-full h-full object-cover" />
            </div>
            <div className="leading-none">
              <p className="text-sm font-black text-base-50 tracking-tight">BigEth</p>
              <p
                className="text-[9px] font-bold uppercase tracking-[0.18em] leading-none"
                style={{ color: '#22c55e' }}
              >
                Finance Tracker
              </p>
            </div>
          </div>

          {/* Right placeholder — keeps logo centred */}
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-base-700">
            <Bell className="w-4 h-4" />
          </div>
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
