import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp, TrendingDown, Loader2, AlertCircle,
  CheckCircle2, ChevronRight,
} from 'lucide-react';
import Layout from '../components/Layout';
import api from '../services/api';

const EXPENSE_CATEGORIES = [
  'Rent', 'Utilities', 'Salary', 'Office Supplies', 'Marketing',
  'Transport', 'Food & Dining', 'Software', 'Equipment', 'Maintenance',
  'Healthcare', 'Insurance', 'Taxes', 'Miscellaneous',
];

const INCOME_CATEGORIES = [
  'Sales Revenue', 'Service Fee', 'Consulting', 'Investment Return',
  'Loan Repayment Received', 'Grant', 'Freelance', 'Bonus', 'Other Income',
];

export default function AddTransaction() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    type: 'expense',
    amount: '',
    category: '',
    reason: '',
    cashSource: 'company',
    description: '',
  });
  const [borrowData, setBorrowData] = useState({ fromWhom: '', dueDate: '', notes: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.amount || parseFloat(form.amount) <= 0) {
      setError('Please enter a valid amount.');
      return;
    }
    if (!form.category) {
      setError('Please select a category.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await api.post('/transactions', {
        ...form,
        amount: parseFloat(form.amount),
        borrowData: form.cashSource === 'borrowed' ? borrowData : undefined,
      });
      setSuccess(true);
      setTimeout(() => navigate('/transactions'), 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add transaction');
    } finally {
      setLoading(false);
    }
  };

  const categories = form.type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  if (success) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center h-64 animate-fade-in">
          <div className="w-16 h-16 rounded-full bg-accent-900/40 border border-accent-700/40 flex items-center justify-center mb-4">
            <CheckCircle2 className="w-8 h-8 text-accent-400" />
          </div>
          <h2 className="text-xl font-bold text-base-100 mb-1">Transaction added!</h2>
          <p className="text-base-400 text-sm">Redirecting to transactions...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-2xl">
        <div className="mb-6 sm:mb-7">
          <h1 className="text-xl sm:text-2xl font-bold text-base-50">Add Transaction</h1>
          <p className="text-base-400 text-sm mt-0.5">Record a new income or expense entry</p>
        </div>

        {/* Type toggle */}
        <div className="glass p-1.5 flex gap-1 mb-5 sm:mb-6 rounded-2xl w-full sm:w-fit">
          {['expense', 'income'].map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setForm((f) => ({ ...f, type: t, category: '' }))}
              className={`flex flex-1 sm:flex-none items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                form.type === t
                  ? t === 'income'
                    ? 'bg-accent-900/60 text-accent-400 border border-accent-700/50 shadow-green'
                    : 'bg-red-900/60 text-red-400 border border-red-700/40'
                  : 'text-base-400 hover:text-base-200'
              }`}
            >
              {t === 'income' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {error && (
          <div className="flex items-center gap-2.5 bg-red-950/50 border border-red-800/50 text-red-400 px-4 py-3 rounded-xl mb-5 text-sm animate-fade-in">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="glass p-4 sm:p-6 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Amount */}
              <div>
                <label className="label">Amount (ETB)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-base-400 text-sm font-medium">Br</span>
                  <input
                    name="amount"
                    type="number"
                    min="0.01"
                    step="0.01"
                    placeholder="0.00"
                    value={form.amount}
                    onChange={handleChange}
                    required
                    className="input pl-8"
                  />
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="label">Category</label>
                <select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  required
                  className="select"
                >
                  <option value="">Select category</option>
                  {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            {/* Reason */}
            <div>
              <label className="label">Reason / Purpose</label>
              <input
                name="reason"
                type="text"
                placeholder="What is this for?"
                value={form.reason}
                onChange={handleChange}
                className="input"
              />
            </div>

            {/* Cash Source */}
            <div>
              <label className="label">Cash Source</label>
              <div className="flex gap-2 sm:gap-3 flex-wrap">
                {[
                  { val: 'personal', label: 'Personal', color: 'blue' },
                  { val: 'company',  label: 'Company',  color: 'purple' },
                  { val: 'borrowed', label: 'Borrowed', color: 'amber' },
                ].map(({ val, label, color }) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, cashSource: val }))}
                    className={`flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-sm font-medium border transition-all duration-200 ${
                      form.cashSource === val
                        ? `bg-${color}-900/50 text-${color}-400 border-${color}-700/50`
                        : 'bg-base-800 text-base-400 border-base-600 hover:border-base-500'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Borrowed sub-fields */}
            {form.cashSource === 'borrowed' && (
              <div className="bg-amber-950/20 border border-amber-800/30 rounded-xl p-4 space-y-4 animate-fade-in">
                <p className="text-xs text-amber-400 font-semibold uppercase tracking-wider">Borrow Details</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="label">Lender Name</label>
                    <input
                      type="text"
                      placeholder="Who lent you the money?"
                      value={borrowData.fromWhom}
                      onChange={(e) => setBorrowData((b) => ({ ...b, fromWhom: e.target.value }))}
                      required
                      className="input text-sm"
                    />
                  </div>
                  <div>
                    <label className="label">Due Date (optional)</label>
                    <input
                      type="date"
                      value={borrowData.dueDate}
                      onChange={(e) => setBorrowData((b) => ({ ...b, dueDate: e.target.value }))}
                      className="input text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="label">Notes</label>
                  <input
                    type="text"
                    placeholder="Any additional notes..."
                    value={borrowData.notes}
                    onChange={(e) => setBorrowData((b) => ({ ...b, notes: e.target.value }))}
                    className="input text-sm"
                  />
                </div>
              </div>
            )}

            {/* Description */}
            <div>
              <label className="label">Description (optional)</label>
              <textarea
                name="description"
                rows={3}
                placeholder="Additional details..."
                value={form.description}
                onChange={handleChange}
                className="input resize-none"
              />
            </div>
          </div>

          {/* Submit */}
          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center gap-3 mt-5">
            <button
              type="button"
              onClick={() => navigate('/transactions')}
              className="btn-secondary justify-center"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary py-3 px-8 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:transform-none justify-center flex-1 sm:flex-none"
            >
              {loading ? (
                <><Loader2 className="w-4 h-4 animate-spin" />Saving...</>
              ) : (
                <><ChevronRight className="w-4 h-4" />Save Transaction</>
              )}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
