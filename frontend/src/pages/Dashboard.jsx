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
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);

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

      // Build pie chart data from categories
      const catMap = {};
      txRes.data.transactions.forEach((t) => {
        catMap[t.category] = (catMap[t.category] || 0) + t.amount;
      });
      setPieData(
        Object.entries(catMap).map(([name, value]) => ({ name, value }))
      );
    } catch (err) {
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchChart = useCallback(async () => {
    try {
      const { data } = await api.get('/transactions?limit=30');
      // Group by date for area chart
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

  useEffect(() => {
    fetchData();
    fetchChart();
  }, [fetchData, fetchChart]);

  // Real-time updates
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
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-base-50">
            Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'},{' '}
            <span className="text-accent-400">{user?.name?.split(' ')[0]}</span> 
          </h1>
          <p className="text-base-400 text-sm mt-0.5">Here's your financial overview</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => { fetchData(); fetchChart(); }} className="btn-ghost text-sm">
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
          <Link to="/add-transaction" className="btn-primary text-sm">
            <Plus className="w-4 h-4" />
            Add Entry
          </Link>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Balance */}
        <div className="stat-card col-span-1 sm:col-span-2 lg:col-span-1" style={{ borderColor: balance >= 0 ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)' }}>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-base-400 font-medium uppercase tracking-wider mb-2">Net Balance</p>
              <p className={`text-3xl font-bold ${balance >= 0 ? 'text-accent-400' : 'text-red-400'}`}>
                {fmt(balance)}
              </p>
              <p className="text-xs text-base-500 mt-1">{stats?.totalTransactions || 0} total transactions</p>
            </div>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${balance >= 0 ? 'bg-accent-900/40 border border-accent-800/40' : 'bg-red-900/40 border border-red-800/40'}`}>
              <Wallet className={`w-5 h-5 ${balance >= 0 ? 'text-accent-400' : 'text-red-400'}`} />
            </div>
          </div>
        </div>

        {/* Income */}
        <div className="stat-card">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-base-400 font-medium uppercase tracking-wider mb-2">Total Income</p>
              <p className="text-2xl font-bold text-accent-400">{fmt(stats?.totalIncome || 0)}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-accent-900/40 border border-accent-800/40 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-accent-400" />
            </div>
          </div>
          <div className="mt-3 flex items-center gap-1 text-xs text-accent-500">
            <ArrowUpRight className="w-3 h-3" />
            <span>All time</span>
          </div>
        </div>

        {/* Expense */}
        <div className="stat-card">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-base-400 font-medium uppercase tracking-wider mb-2">Total Expense</p>
              <p className="text-2xl font-bold text-red-400">{fmt(stats?.totalExpense || 0)}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-red-900/40 border border-red-800/40 flex items-center justify-center">
              <TrendingDown className="w-5 h-5 text-red-400" />
            </div>
          </div>
          <div className="mt-3 flex items-center gap-1 text-xs text-red-500/70">
            <ArrowUpRight className="w-3 h-3 rotate-90" />
            <span>All time</span>
          </div>
        </div>

        {/* Borrowed */}
        <div className="stat-card">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-base-400 font-medium uppercase tracking-wider mb-2">Pending Debt</p>
              <p className="text-2xl font-bold text-amber-400">{fmt(stats?.pendingBorrow || 0)}</p>
              <p className="text-xs text-base-500 mt-1">{stats?.pendingBorrowCount || 0} open loans</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-900/40 border border-amber-800/40 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Area Chart */}
        <div className="glass p-6 lg:col-span-2">
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
                <XAxis dataKey="date" tick={{ fill: '#888', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#888', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} />
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

        {/* Pie Chart */}
        <div className="glass p-6">
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
              <div className="flex flex-wrap justify-center gap-x-4 gap-y-1.5 mt-2">
                {pieData.map((d, i) => (
                  <div key={i} className="flex items-center gap-1.5 text-xs text-base-400">
                    <div className="w-2 h-2 rounded-full" style={{ background: CATEGORY_COLORS[i % CATEGORY_COLORS.length] }} />
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
        <div className="flex items-center justify-between px-6 py-4 border-b border-base-800">
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
          <div className="overflow-x-auto">
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
        )}
      </div>
    </Layout>
  );
}
