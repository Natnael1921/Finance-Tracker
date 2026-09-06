import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp, TrendingDown, Wallet, AlertTriangle,
  ArrowUpRight, Plus, RefreshCw,
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';
import Layout from '../components/Layout';
import api from '../services/api';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';

const fmt = (n) =>
  new Intl.NumberFormat('en-ET', { style: 'currency', currency: 'ETB', maximumFractionDigits: 0 }).format(n);

const CATEGORY_COLORS = ['#22c55e', '#4ade80', '#86efac', '#3a3a3a', '#555555', '#888888'];

export default function Dashboard() {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [pieData, setPieData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [statsRes, txRes] = await Promise.all([
        api.get('/transactions/stats'),
        api.get('/transactions?limit=5'),
      ]);
      setStats(statsRes.data.stats);
      setRecent(txRes.data.transactions);
      const catMap = {};
      txRes.data.transactions.forEach((t) => {
        catMap[t.category] = (catMap[t.category] || 0) + t.amount;
      });
      setPieData(Object.entries(catMap).map(([name, value]) => ({ name, value })));
    } catch (err) {
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchChart = useCallback(async () => {
    try {
      const { data } = await api.get('/transactions?limit=30');
      const grouped = {};
      data.transactions.forEach((t) => {
        const date = new Date(t.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        if (!grouped[date]) grouped[date] = { date, income: 0, expense: 0 };
        if (t.type === 'income') grouped[date].income += t.amount;
        else grouped[date].expense += t.amount;
      });
      setChartData(Object.values(grouped).reverse());
    } catch (err) {
      console.error('Chart fetch error:', err);
    }
  }, []);

  useEffect(() => { fetchData(); fetchChart(); }, [fetchData, fetchChart]);

  useEffect(() => {
    if (!socket) return;
    const refresh = () => { fetchData(); fetchChart(); };
    socket.on('transaction-added', refresh);
    socket.on('transaction-updated', refresh);
    socket.on('transaction-deleted', refresh);
    return () => {
      socket.off('transaction-added', refresh);
      socket.off('transaction-updated', refresh);
      socket.off('transaction-deleted', refresh);
    };
  }, [socket, fetchData, fetchChart]);

  const balance = stats ? stats.balance : 0;

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="spinner w-10 h-10" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* ── Hero Header ─────────────────────────────────────────────── */}
      <div className="relative rounded-2xl overflow-hidden mb-6 sm:mb-8 p-5 sm:p-7"
        style={{
          background: 'linear-gradient(135deg, rgba(34,197,94,0.08) 0%, rgba(13,13,13,0) 60%)',
          border: '1px solid rgba(34,197,94,0.12)',
        }}
      >
        {/* Decorative glow blob */}
        <div className="absolute -top-10 -left-10 w-48 h-48 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(34,197,94,0.08) 0%, transparent 70%)' }}
        />

        <div className="flex items-start justify-between gap-3 relative z-10">
          <div>
            <p className="text-xs text-accent-500 font-semibold uppercase tracking-widest mb-1">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
            <h1 className="text-xl sm:text-2xl font-bold text-base-50 leading-tight">
              Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'},{' '}
              <span className="text-accent-400">{user?.name?.split(' ')[0]}</span> 👋
            </h1>
            <p className="text-base-500 text-sm mt-1">Here's your financial overview</p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => { fetchData(); fetchChart(); }}
              className="w-9 h-9 rounded-xl bg-base-800/80 border border-base-700 flex items-center justify-center text-base-400 hover:text-accent-400 hover:border-accent-800 transition-all"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <Link
              to="/add-transaction"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition-all"
              style={{
                background: 'rgba(34,197,94,0.15)',
                border: '1px solid rgba(34,197,94,0.3)',
                color: '#4ade80',
                boxShadow: '0 0 16px rgba(34,197,94,0.15)',
              }}
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add Entry</span>
              <span className="sm:hidden">Add</span>
            </Link>
          </div>
        </div>
      </div>

      {/* ── Stat Cards ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">

        {/* Balance — spans full width on mobile */}
        <div
          className="col-span-2 lg:col-span-1 rounded-2xl p-5 relative overflow-hidden"
          style={{
            background: balance >= 0
              ? 'linear-gradient(135deg, rgba(34,197,94,0.1), rgba(26,26,26,0.9))'
              : 'linear-gradient(135deg, rgba(239,68,68,0.1), rgba(26,26,26,0.9))',
            border: `1px solid ${balance >= 0 ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}`,
          }}
        >
          <div className="absolute -bottom-4 -right-4 w-24 h-24 rounded-full pointer-events-none"
            style={{ background: balance >= 0 ? 'rgba(34,197,94,0.06)' : 'rgba(239,68,68,0.06)' }}
          />
          <div className="flex items-start justify-between relative z-10">
            <div>
              <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-widest mb-2"
                style={{ color: balance >= 0 ? '#4ade80' : '#f87171', opacity: 0.8 }}
              >Net Balance</p>
              <p className={`text-2xl sm:text-3xl font-black ${balance >= 0 ? 'text-accent-400' : 'text-red-400'}`}>
                {fmt(balance)}
              </p>
              <p className="text-xs text-base-500 mt-1.5">{stats?.totalTransactions || 0} transactions</p>
            </div>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${balance >= 0 ? 'bg-accent-900/50 border border-accent-800/50' : 'bg-red-900/50 border border-red-800/50'}`}>
              <Wallet className={`w-5 h-5 ${balance >= 0 ? 'text-accent-400' : 'text-red-400'}`} />
            </div>
          </div>
        </div>

        {/* Income */}
        <div className="rounded-2xl p-4 sm:p-5 relative overflow-hidden"
          style={{ background: 'rgba(26,26,26,0.7)', border: '1px solid rgba(34,197,94,0.12)' }}
        >
          <div className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full"
            style={{ background: 'linear-gradient(90deg, #22c55e, transparent)' }}
          />
          <div className="flex items-start justify-between mb-3">
            <div className="w-8 h-8 rounded-lg bg-accent-900/50 border border-accent-800/40 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-accent-400" />
            </div>
            <ArrowUpRight className="w-3.5 h-3.5 text-accent-600" />
          </div>
          <p className="text-[10px] text-base-500 font-semibold uppercase tracking-wider mb-1">Income</p>
          <p className="text-lg sm:text-xl font-black text-accent-400">{fmt(stats?.totalIncome || 0)}</p>
        </div>

        {/* Expense */}
        <div className="rounded-2xl p-4 sm:p-5 relative overflow-hidden"
          style={{ background: 'rgba(26,26,26,0.7)', border: '1px solid rgba(239,68,68,0.12)' }}
        >
          <div className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full"
            style={{ background: 'linear-gradient(90deg, #ef4444, transparent)' }}
          />
          <div className="flex items-start justify-between mb-3">
            <div className="w-8 h-8 rounded-lg bg-red-900/50 border border-red-800/40 flex items-center justify-center">
              <TrendingDown className="w-4 h-4 text-red-400" />
            </div>
            <ArrowUpRight className="w-3.5 h-3.5 text-red-700 rotate-90" />
          </div>
          <p className="text-[10px] text-base-500 font-semibold uppercase tracking-wider mb-1">Expense</p>
          <p className="text-lg sm:text-xl font-black text-red-400">{fmt(stats?.totalExpense || 0)}</p>
        </div>

        {/* Debt */}
        <div className="rounded-2xl p-4 sm:p-5 relative overflow-hidden"
          style={{ background: 'rgba(26,26,26,0.7)', border: '1px solid rgba(217,119,6,0.15)' }}
        >
          <div className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full"
            style={{ background: 'linear-gradient(90deg, #f59e0b, transparent)' }}
          />
          <div className="flex items-start justify-between mb-3">
            <div className="w-8 h-8 rounded-lg bg-amber-900/50 border border-amber-800/40 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
            </div>
            <span className="text-[10px] text-amber-700 font-medium">{stats?.pendingBorrowCount || 0} open</span>
          </div>
          <p className="text-[10px] text-base-500 font-semibold uppercase tracking-wider mb-1">Pending Debt</p>
          <p className="text-lg sm:text-xl font-black text-amber-400">{fmt(stats?.pendingBorrow || 0)}</p>
        </div>

      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <div className="glass p-4 sm:p-6 lg:col-span-2">
          <h2 className="text-sm font-semibold text-base-200 mb-4">Income vs Expense (Recent)</h2>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="date" tick={{ fill: '#888', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#888', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} width={45} />
                <Tooltip
                  contentStyle={{ background: '#1a1a1a', border: '1px solid #2d2d2d', borderRadius: '12px', fontSize: '12px' }}
                  labelStyle={{ color: '#d4d4d4' }}
                  formatter={(value, name) => [fmt(value), name === 'income' ? 'Income' : 'Expense']}
                />
                <Area type="monotone" dataKey="income" stroke="#22c55e" strokeWidth={2} fill="url(#colorIncome)" dot={false} />
                <Area type="monotone" dataKey="expense" stroke="#ef4444" strokeWidth={2} fill="url(#colorExpense)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-base-500 text-sm">No data yet</div>
          )}
        </div>

        <div className="glass p-4 sm:p-6">
          <h2 className="text-sm font-semibold text-base-200 mb-4">By Category</h2>
          {pieData.length > 0 ? (
            <div className="flex flex-col items-center">
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value" paddingAngle={3}>
                    {pieData.map((_, i) => (
                      <Cell key={i} fill={CATEGORY_COLORS[i % CATEGORY_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: '#1a1a1a', border: '1px solid #2d2d2d', borderRadius: '12px', fontSize: '12px' }}
                    formatter={(value) => [fmt(value), 'Amount']}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap justify-center gap-x-3 gap-y-1.5 mt-2">
                {pieData.map((d, i) => (
                  <div key={i} className="flex items-center gap-1.5 text-xs text-base-400">
                    <div className="w-2 h-2 rounded-full shrink-0" style={{ background: CATEGORY_COLORS[i % CATEGORY_COLORS.length] }} />
                    {d.name}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-[160px] flex items-center justify-center text-base-500 text-sm">No data yet</div>
          )}
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="glass overflow-hidden">
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-base-800">
          <h2 className="text-sm font-semibold text-base-200">Recent Transactions</h2>
          <Link to="/transactions" className="text-xs text-accent-500 hover:text-accent-400 font-medium transition-colors">
            View all →
          </Link>
        </div>

        {recent.length === 0 ? (
          <div className="py-12 text-center text-base-500 text-sm">
            No transactions yet.{' '}
            <Link to="/add-transaction" className="text-accent-500 hover:underline">Add one now.</Link>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-base-800/60">
                  <tr>
                    {['Type', 'Amount', 'Category', 'Cash Source', 'By', 'Date'].map((h) => (
                      <th key={h} className="table-header">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {recent.map((t) => (
                    <tr key={t._id} className="table-row">
                      <td className="table-cell">
                        <span className={t.type === 'income' ? 'badge-income' : 'badge-expense'}>
                          {t.type === 'income' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                          {t.type}
                        </span>
                      </td>
                      <td className="table-cell">
                        <span className={`font-semibold ${t.type === 'income' ? 'text-accent-400' : 'text-red-400'}`}>
                          {t.type === 'expense' ? '-' : '+'}{fmt(t.amount)}
                        </span>
                      </td>
                      <td className="table-cell text-base-300">{t.category}</td>
                      <td className="table-cell">
                        <span className={`badge-${t.cashSource}`}>{t.cashSource}</span>
                      </td>
                      <td className="table-cell text-base-400">{t.createdBy?.name}</td>
                      <td className="table-cell text-base-500 text-xs">
                        {new Date(t.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile card list — same premium style as Transactions page */}
            <div className="md:hidden flex flex-col">
              {recent.map((t) => {
                const isIncome = t.type === 'income';
                return (
                  <div
                    key={t._id}
                    className="relative flex items-stretch"
                    style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
                  >
                    {/* Colored left border strip */}
                    <div
                      className="w-1 shrink-0 rounded-r-full my-3"
                      style={{ background: isIncome ? '#22c55e' : '#ef4444' }}
                    />

                    {/* Content */}
                    <div className="flex-1 px-4 py-3.5">
                      {/* Top: icon + category + amount */}
                      <div className="flex items-center gap-3">
                        <div
                          className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                          style={{
                            background: isIncome ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)',
                            border: `1px solid ${isIncome ? 'rgba(34,197,94,0.25)' : 'rgba(239,68,68,0.25)'}`,
                          }}
                        >
                          {isIncome
                            ? <TrendingUp className="w-4 h-4 text-accent-400" />
                            : <TrendingDown className="w-4 h-4 text-red-400" />
                          }
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-base-100 truncate">{t.category}</p>
                          {t.createdBy?.name && (
                            <p className="text-[11px] text-base-500 mt-0.5">by {t.createdBy.name}</p>
                          )}
                        </div>
                        <div className="text-right shrink-0">
                          <p className={`text-sm font-bold ${isIncome ? 'text-accent-400' : 'text-red-400'}`}>
                            {isIncome ? '+' : '-'}{fmt(t.amount)}
                          </p>
                          <p className="text-[10px] text-base-500 mt-0.5">
                            {new Date(t.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </p>
                        </div>
                      </div>

                      {/* Bottom: source badge */}
                      <div className="mt-2.5 pl-12">
                        <span className={`badge-${t.cashSource}`}>{t.cashSource}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

          </>
        )}
      </div>
    </Layout>
  );
}
