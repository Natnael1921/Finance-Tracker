import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  ArrowLeftRight,
  PlusCircle,
  Users,
  LogOut,
  TrendingUp,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';

const navItems = [
  { to: '/dashboard',        label: 'Dashboard',     icon: LayoutDashboard },
  { to: '/transactions',     label: 'Transactions',  icon: ArrowLeftRight  },
  { to: '/add-transaction',  label: 'Add Entry',     icon: PlusCircle      },
];

export default function Sidebar() {
  const { user, logout, isSuperAdmin } = useAuth();
  const { connected } = useSocket();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="flex flex-col w-64 min-h-screen bg-base-900 border-r border-base-800 px-4 py-6 shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-3 px-2 mb-8">
        <div className="w-9 h-9 rounded-xl bg-accent-500 flex items-center justify-center shadow-green">
          <TrendingUp className="w-5 h-5 text-base-black" />
        </div>
        <div>
          <p className="font-bold text-base-50 text-sm leading-tight">Finance</p>
          <p className="text-accent-400 text-xs font-semibold tracking-widest uppercase">Tracker</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-1 flex-1">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `nav-item ${isActive ? 'active' : ''}`
            }
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
        {/* Connection status */}
        <div className="flex items-center gap-2 px-2 py-1.5">
          {connected ? (
            <>
              <Wifi className="w-3.5 h-3.5 text-accent-500" />
              <span className="text-xs text-accent-500 font-medium">Live</span>
              <div className="w-1.5 h-1.5 bg-accent-500 rounded-full animate-pulse-slow ml-auto" />
            </>
          ) : (
            <>
              <WifiOff className="w-3.5 h-3.5 text-base-400" />
              <span className="text-xs text-base-400">Offline</span>
            </>
          )}
        </div>

        {/* User info */}
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
