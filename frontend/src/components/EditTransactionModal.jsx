import { useState } from 'react';
import { X, Loader2, Save } from 'lucide-react';
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

export default function EditTransactionModal({ transaction, onClose, onSaved }) {
  const [form, setForm] = useState({
    type: transaction.type,
    amount: transaction.amount,
    category: transaction.category,
    reason: transaction.reason || '',
    cashSource: transaction.cashSource,
    description: transaction.description || '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await api.put(`/transactions/${transaction._id}`, {
        ...form,
        amount: parseFloat(form.amount),
      });
      onSaved();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update');
    } finally {
      setSaving(false);
    }
  };

  const categories = form.type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  return (
    /* Backdrop */
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-base-black/70 backdrop-blur-sm animate-fade-in">
      {/* Panel — sheet on mobile, centered modal on sm+ */}
      <div className="glass w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl flex flex-col animate-slide-up max-h-[92dvh] sm:max-h-[90vh]">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-base-800 shrink-0">
          <h2 className="text-base font-semibold text-base-100">Edit Transaction</h2>
          <button onClick={onClose} className="btn-ghost p-2 -mr-1">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto overscroll-contain">
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            {error && (
              <div className="text-sm text-red-400 bg-red-950/40 border border-red-800/40 px-3 py-2.5 rounded-lg">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Type</label>
                <select name="type" value={form.type} onChange={handleChange} className="select text-sm w-full">
                  <option value="income">Income</option>
                  <option value="expense">Expense</option>
                </select>
              </div>
              <div>
                <label className="label">Amount (ETB)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-base-400 text-sm">Br</span>
                  <input
                    name="amount" type="number" min="0.01" step="0.01" required
                    value={form.amount}
                    onChange={handleChange}
                    className="input pl-8 text-sm w-full"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Category</label>
                <select name="category" value={form.category} onChange={handleChange} className="select text-sm w-full">
                  {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Cash Source</label>
                <select name="cashSource" value={form.cashSource} onChange={handleChange} className="select text-sm w-full">
                  <option value="personal">Personal</option>
                  <option value="company">Company</option>
                  <option value="borrowed">Borrowed</option>
                </select>
              </div>
            </div>

            <div>
              <label className="label">Reason</label>
              <input
                name="reason" type="text" placeholder="What's this for?"
                value={form.reason}
                onChange={handleChange}
                className="input text-sm w-full"
              />
            </div>

            <div>
              <label className="label">Description</label>
              <textarea
                name="description" rows={2} placeholder="Optional details..."
                value={form.description}
                onChange={handleChange}
                className="input resize-none text-sm w-full"
              />
            </div>

            {/* Buttons — stacked on mobile */}
            <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-1 pb-2">
              <button type="button" onClick={onClose} className="btn-secondary text-sm w-full sm:w-auto justify-center">
                Cancel
              </button>
              <button type="submit" disabled={saving} className="btn-primary text-sm disabled:opacity-60 w-full sm:w-auto justify-center">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
