import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Search, Filter, TrendingUp, TrendingDown, Pencil,
  Trash2, Loader2, ChevronLeft, ChevronRight, X, Plus,
} from 'lucide-react';
import Layout from '../components/Layout';
import api from '../services/api';
import { useSocket } from '../context/SocketContext';
import EditTransactionModal from '../components/EditTransactionModal';

const fmt = (n) =>
  new Intl.NumberFormat('en-ET', { style: 'currency', currency: 'ETB', maximumFractionDigits: 0 }).format(n);

export default function Transactions() {
  const { socket } = useSocket();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);
  const [editingTx, setEditingTx] = useState(null);
  const [filters, setFilters] = useState({ type: '', cashSource: '', search: '' });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 15, ...filters });
      ['type', 'cashSource', 'search'].forEach((k) => { if (!filters[k]) params.delete(k); });
      const { data } = await api.get(`/transactions?${params}`);
      setTransactions(data.transactions);
      setTotalPages(data.pages);
      setTotal(data.total);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, filters]);

  useEffect(() => { fetchTransactions(); }, [fetchTransactions]);
  useEffect(() => { setPage(1); }, [filters]);

  useEffect(() => {
    if (!socket) return;
    socket.on('transaction-added', fetchTransactions);
    socket.on('transaction-updated', fetchTransactions);
    socket.on('transaction-deleted', fetchTransactions);
    return () => {
      socket.off('transaction-added', fetchTransactions);
      socket.off('transaction-updated', fetchTransactions);
      socket.off('transaction-deleted', fetchTransactions);
    };
  }, [socket, fetchTransactions]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this transaction?')) return;
    setDeleting(id);
    try {
      await api.delete(`/transactions/${id}`);
      fetchTransactions();
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed');
    } finally {
      setDeleting(null);
    }
  };

  const clearFilters = () => setFilters({ type: '', cashSource: '', search: '' });
  const hasFilters = filters.type || filters.cashSource || filters.search;

  return (
    <Layout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-5 sm:mb-6 gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-base-50">Transactions</h1>
          <p className="text-base-400 text-sm mt-0.5">{total} total entries</p>
        </div>
        <Link to="/add-transaction" className="btn-primary text-sm self-start sm:self-auto">
          <Plus className="w-4 h-4" />
          <span>Add Entry</span>
        </Link>
      </div>

      {/* Filters */}
      <div className="glass p-4 mb-5 flex flex-col sm:flex-row flex-wrap gap-3 sm:items-center">
        {/* Search — full width on mobile */}
        <div className="relative w-full sm:flex-1 sm:min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-base-500" />
          <input
            type="text"
            placeholder="Search category, description..."
            value={filters.search}
            onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
            className="input pl-9 py-2.5 text-sm w-full"
          />
        </div>

        <div className="flex gap-3 flex-wrap">
          {/* Type filter */}
          <div className="flex items-center gap-1.5 flex-1 sm:flex-none">
            <Filter className="w-4 h-4 text-base-500 shrink-0" />
            <select
              value={filters.type}
              onChange={(e) => setFilters((f) => ({ ...f, type: e.target.value }))}
              className="select text-sm py-2.5 flex-1 sm:min-w-[130px]"
            >
              <option value="">All Types</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
          </div>

          {/* Source filter */}
          <select
            value={filters.cashSource}
            onChange={(e) => setFilters((f) => ({ ...f, cashSource: e.target.value }))}
            className="select text-sm py-2.5 flex-1 sm:min-w-[150px]"
          >
            <option value="">All Sources</option>
            <option value="personal">Personal</option>
            <option value="company">Company</option>
            <option value="borrowed">Borrowed</option>
          </select>

          {hasFilters && (
            <button onClick={clearFilters} className="btn-ghost text-sm text-base-400">
              <X className="w-3.5 h-3.5" /> Clear
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="glass overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-7 h-7 text-accent-500 animate-spin" />
          </div>
        ) : transactions.length === 0 ? (
          <div className="py-16 text-center text-base-500 text-sm">
            No transactions found.{' '}
            <Link to="/add-transaction" className="text-accent-500 hover:underline">Add one now.</Link>
          </div>
        ) : (
          <>
            {/* Desktop table — md and up */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-base-800">
                  <tr>
                    {['Type', 'Amount', 'Category', 'Reason', 'Source', 'By', 'Date', ''].map((h) => (
                      <th key={h} className="table-header">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((t) => (
                    <tr key={t._id} className="table-row animate-fade-in">
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
                      <td className="table-cell font-medium text-base-200">{t.category}</td>
                      <td className="table-cell text-base-400 max-w-[150px] truncate">{t.reason || '—'}</td>
                      <td className="table-cell">
                        <span className={`badge-${t.cashSource}`}>{t.cashSource}</span>
                      </td>
                      <td className="table-cell text-base-400 text-xs">{t.createdBy?.name}</td>
                      <td className="table-cell text-base-500 text-xs whitespace-nowrap">
                        {new Date(t.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' })}
                      </td>
                      <td className="table-cell">
                        <div className="flex items-center gap-1">
                          <button onClick={() => setEditingTx(t)} className="btn-ghost p-2 text-base-500 hover:text-base-200">
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(t._id)}
                            disabled={deleting === t._id}
                            className="btn-ghost p-2 text-base-500 hover:text-red-400"
                          >
                            {deleting === t._id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile card list */}
            <div className="md:hidden flex flex-col gap-0">
              {transactions.map((t, idx) => {
                const isIncome = t.type === 'income';
                return (
                  <div
                    key={t._id}
                    className="relative flex items-stretch animate-fade-in"
                    style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
                  >
                    {/* Colored left border strip */}
                    <div
                      className="w-1 shrink-0 rounded-r-full my-3"
                      style={{ background: isIncome ? '#22c55e' : '#ef4444' }}
                    />

                    {/* Card content */}
                    <div className="flex-1 px-4 py-4">
                      {/* Top row: icon + category + amount */}
                      <div className="flex items-center gap-3">
                        {/* Type icon circle */}
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
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

                        {/* Category + reason */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-base-100 truncate">{t.category}</p>
                          {t.reason && (
                            <p className="text-xs text-base-500 truncate mt-0.5">{t.reason}</p>
                          )}
                        </div>

                        {/* Amount — prominent */}
                        <div className="text-right shrink-0">
                          <p className={`text-base font-bold ${isIncome ? 'text-accent-400' : 'text-red-400'}`}>
                            {isIncome ? '+' : '-'}{fmt(t.amount)}
                          </p>
                          <p className="text-[10px] text-base-500 mt-0.5">
                            {new Date(t.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </p>
                        </div>
                      </div>

                      {/* Bottom row: source badge + by + actions */}
                      <div className="flex items-center justify-between mt-3 pl-[52px]">
                        <div className="flex items-center gap-2">
                          <span className={`badge-${t.cashSource}`}>{t.cashSource}</span>
                          {t.createdBy?.name && (
                            <span className="text-[10px] text-base-600">by {t.createdBy.name}</span>
                          )}
                        </div>
                        <div className="flex items-center gap-0.5">
                          <button
                            onClick={() => setEditingTx(t)}
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-base-600 hover:text-base-300 hover:bg-base-800 transition-colors"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(t._id)}
                            disabled={deleting === t._id}
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-base-600 hover:text-red-400 hover:bg-red-900/20 transition-colors"
                          >
                            {deleting === t._id
                              ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              : <Trash2 className="w-3.5 h-3.5" />
                            }
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

          </>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-t border-base-800">
            <span className="text-xs text-base-500">Page {page} of {totalPages}</span>
            <div className="flex items-center gap-2">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="btn-ghost p-2 disabled:opacity-40">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="btn-ghost p-2 disabled:opacity-40">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {editingTx && (
        <EditTransactionModal
          transaction={editingTx}
          onClose={() => setEditingTx(null)}
          onSaved={() => { setEditingTx(null); fetchTransactions(); }}
        />
      )}
    </Layout>
  );
}
