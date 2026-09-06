import { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  ArrowLeftRight,
  PlusCircle,
  Users,
  LogOut,
  TrendingUp,
  Wifi,
  WifiOff,
  Menu,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';

const navItems = [
  { to: '/dashboard',       label: 'Dashboard',    icon: LayoutDashboard },
  { to: '/transactions',    label: 'Transactions', icon: ArrowLeftRight  },
  { to: '/add-transaction', label: 'Add Entry',    icon: PlusCircle      },
];

/* ── Sidebar (desktop) ─────────────────────────────────────────────────── */
function DesktopSidebar({ user, connected, isSuperAdmin, handleLogout }) {
  return (
    <aside className="hidden lg:flex flex-col fixed top-0 left-0 h-screen w-64 bg-base-900 border-r border-base-800 px-4 py-6 shrink-0 z-30 overflow-y-auto">
      {/* Logo */}
      <div className="flex items-center gap-3 px-2 mb-8">
        <div className="w-10 h-10 rounded-xl overflow-hidden border border-accent-700/40 shrink-0">
          <img src="/icon-192.png" alt="BE Logo" className="w-full h-full object-cover" />
        </div>
        <div>
          <p className="font-bold text-base-50 text-sm leading-tight">Big Ethiopia</p>
          <p className="text-accent-400 text-[10px] font-semibold tracking-widest uppercase">Finance Tracker</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-1 flex-1">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <Icon className="w-4 h-4 shrink-0" />
            {label}
          </NavLink>
        ))}

        {isSuperAdmin && (
          <NavLink
            to="/users"
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <Users className="w-4 h-4 shrink-0" />
            Manage Users
          </NavLink>
        )}
      </nav>

      {/* Bottom section */}
      <div className="space-y-3 pt-4 border-t border-base-800">
        <div className="flex items-center gap-2 px-2 py-1.5">
          {connected ? (
            <>
              <Wifi className="w-3.5 h-3.5 text-accent-500" />
              <span className="text-xs text-accent-500 font-medium">Live</span>
              <div className="w-1.5 h-1.5 bg-accent-500 rounded-full animate-pulse ml-auto" />
            </>
          ) : (
            <>
              <WifiOff className="w-3.5 h-3.5 text-base-400" />
              <span className="text-xs text-base-400">Offline</span>
            </>
          )}
        </div>

        <div className="glass-dark px-3 py-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-accent-900/60 border border-accent-700/40 flex items-center justify-center shrink-0">
            <span className="text-accent-400 text-xs font-bold uppercase">
              {user?.name?.charAt(0)}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-base-100 truncate">{user?.name}</p>
            <p className="text-xs text-base-400 capitalize">{user?.role}</p>
          </div>
          <button
            onClick={handleLogout}
            className="btn-ghost p-2 text-base-400 hover:text-red-400"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}

/* ── Mobile Drawer ─────────────────────────────────────────────────────── */
function MobileDrawer({ open, onClose, user, connected, isSuperAdmin, handleLogout }) {
  // Lock scroll when open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      {/* Drawer panel */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-72 bg-base-900 border-r border-base-800 flex flex-col px-4 py-6 transition-transform duration-300 ease-out lg:hidden ${open ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {/* Logo + close */}
        <div className="flex items-center justify-between mb-8 px-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl overflow-hidden border border-accent-700/40 shrink-0">
              <img src="/icon-192.png" alt="BE Logo" className="w-full h-full object-cover" />
            </div>
            <div>
              <p className="font-bold text-base-50 text-sm leading-tight">Big Ethiopia</p>
              <p className="text-accent-400 text-[10px] font-semibold tracking-widest uppercase">Finance Tracker</p>
            </div>
          </div>
          <button onClick={onClose} className="btn-ghost p-2 text-base-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-1 flex-1">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) => `nav-item text-base py-3 ${isActive ? 'active' : ''}`}
            >
              <Icon className="w-5 h-5 shrink-0" />
              {label}
            </NavLink>
          ))}

          {isSuperAdmin && (
            <NavLink
              to="/users"
              onClick={onClose}
              className={({ isActive }) => `nav-item text-base py-3 ${isActive ? 'active' : ''}`}
            >
              <Users className="w-5 h-5 shrink-0" />
              Manage Users
            </NavLink>
          )}
        </nav>

        {/* Bottom */}
        <div className="space-y-3 pt-4 border-t border-base-800">
          <div className="flex items-center gap-2 px-2 py-1.5">
            {connected ? (
              <>
                <Wifi className="w-3.5 h-3.5 text-accent-500" />
                <span className="text-xs text-accent-500 font-medium">Live</span>
                <div className="w-1.5 h-1.5 bg-accent-500 rounded-full animate-pulse ml-auto" />
              </>
            ) : (
              <>
                <WifiOff className="w-3.5 h-3.5 text-base-400" />
                <span className="text-xs text-base-400">Offline</span>
              </>
            )}
          </div>

          <div className="glass-dark px-3 py-3 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-accent-900/60 border border-accent-700/40 flex items-center justify-center shrink-0">
              <span className="text-accent-400 text-sm font-bold uppercase">
                {user?.name?.charAt(0)}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-base-100 truncate">{user?.name}</p>
              <p className="text-xs text-base-400 capitalize">{user?.role}</p>
            </div>
            <button
              onClick={() => { handleLogout(); onClose(); }}
              className="btn-ghost p-2 text-base-400 hover:text-red-400"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

/* ── Bottom tab bar (mobile) ───────────────────────────────────────────── */
function BottomTabBar({ isSuperAdmin }) {
  const location = useLocation();
  const tabs = [
    ...navItems,
    ...(isSuperAdmin ? [{ to: '/users', label: 'Users', icon: Users }] : []),
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 lg:hidden bg-base-900/95 backdrop-blur-md border-t border-base-800 flex items-center justify-around px-2 pb-safe">
      {tabs.map(({ to, label, icon: Icon }) => {
        const isActive = location.pathname === to;
        return (
          <NavLink
            key={to}
            to={to}
            className="flex flex-col items-center gap-1 py-3 px-3 min-w-0 flex-1"
          >
            <Icon className={`w-5 h-5 transition-colors ${isActive ? 'text-accent-400' : 'text-base-500'}`} />
            <span className={`text-[10px] font-medium transition-colors truncate ${isActive ? 'text-accent-400' : 'text-base-500'}`}>
              {label}
            </span>
            {isActive && <div className="w-1 h-1 rounded-full bg-accent-400" />}
          </NavLink>
        );
      })}
    </nav>
  );
}

/* ── Main Sidebar export ───────────────────────────────────────────────── */
export default function Sidebar({ drawerOpen, setDrawerOpen }) {
  const { user, logout, isSuperAdmin } = useAuth();
  const { connected } = useSocket();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      <DesktopSidebar
        user={user}
        connected={connected}
        isSuperAdmin={isSuperAdmin}
        handleLogout={handleLogout}
      />
      <MobileDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        user={user}
        connected={connected}
        isSuperAdmin={isSuperAdmin}
        handleLogout={handleLogout}
      />
      <BottomTabBar isSuperAdmin={isSuperAdmin} />
    </>
  );
}
