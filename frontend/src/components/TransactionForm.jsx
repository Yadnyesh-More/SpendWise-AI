import React, { useState } from 'react';
import api from '../api';

function TransactionForm({ onTransactionAdded }) {
  const [type, setType] = useState('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('food');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const categories = {
    expense: ['food', 'transport', 'utilities', 'entertainment', 'shopping', 'health', 'education', 'other'],
    income: ['salary', 'freelance', 'investment', 'bonus', 'gift', 'other'],
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
    if (!amount || Number(amount) <= 0) {
      setError('Please enter a valid amount greater than 0.');
      return;
    }

    setLoading(true);
    try {
      // Build proper payload
      const payload = {
        type,
        amount: Number(amount),
        category: category.toLowerCase().trim(),
        note: note.trim(),
        date: new Date(date).toISOString(),  // ✅ Convert to ISO string
      };

      console.log('📤 Sending payload:', payload);

      const res = await api.post('/transactions', payload);

      console.log('✅ Response:', res.data);

      if (res.data?.success) {
        setSuccess('✅ Transaction added successfully!');

        // Reset form
        setAmount('');
        setNote('');
        setCategory(type === 'expense' ? 'food' : 'salary');
        setDate(new Date().toISOString().split('T')[0]);

        // Refresh dashboard
        onTransactionAdded?.();

        // Clear success message after 2 seconds
        setTimeout(() => setSuccess(''), 2000);
      } else {
        setError(res.data?.message || 'Failed to add transaction');
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Error adding transaction';
      setError(errorMsg);
      console.error('❌ Add transaction error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-dark-surface border border-dark-border rounded-3xl p-8 shadow-md backdrop-blur-sm">
      <h2 className="text-2xl font-black text-text-primary mb-6 flex items-center gap-2">
        💳 <span className="bg-dark-hover px-3 py-1 rounded-lg">Add Transaction</span>
      </h2>

      {/* Error Message */}
      {error && (
        <div className="mb-4 text-sm text-red-300 bg-red-500/20 border border-red-500/40 rounded-xl px-4 py-3 animate-pulse">
          {error}
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="mb-4 text-sm text-green-300 bg-green-500/20 border border-green-500/40 rounded-xl px-4 py-3 animate-pulse">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Type Selection */}
        <div>
          <label className="block text-text-secondary text-sm font-bold mb-3 bg-dark-hover px-3 py-1 rounded-lg w-fit">
            Type
          </label>
          <div className="flex gap-4">
            {['expense', 'income'].map((t) => (
              <label key={t} className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="radio"
                  name="type"
                  value={t}
                  checked={type === t}
                  onChange={(e) => {
                    setType(e.target.value);
                    setCategory(e.target.value === 'expense' ? 'food' : 'salary');
                  }}
                  className="w-5 h-5 cursor-pointer"
                />
                <span
                  className={`text-sm font-bold transition-all ${
                    type === t
                      ? 'text-brand-primary bg-dark-hover px-2 py-1 rounded-lg'
                      : 'text-text-secondary group-hover:text-text-primary'
                  }`}
                >
                  {t === 'expense' ? '💸 Expense' : '📈 Income'}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Amount */}
        <div>
          <label className="block text-text-secondary text-sm font-bold mb-2 bg-dark-hover px-3 py-1 rounded-lg w-fit">
            Amount (₹)
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            step="0.01"
            min="0.01"
            className="w-full"
            required
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-text-secondary text-sm font-bold mb-2 bg-dark-hover px-3 py-1 rounded-lg w-fit">
            Category
          </label>
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full">
            {categories[type].map((cat) => (
              <option key={cat} value={cat} className="capitalize">
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {/* Date */}
        <div>
          <label className="block text-text-secondary text-sm font-bold mb-2 bg-dark-hover px-3 py-1 rounded-lg w-fit">
            Date
          </label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full" required />
        </div>

        {/* Note */}
        <div>
          <label className="block text-text-secondary text-sm font-bold mb-2 bg-dark-hover px-3 py-1 rounded-lg w-fit">
            Note (Optional)
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Add a note..."
            className="w-full resize-none"
            rows="3"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-brand-primary to-accent-teal text-dark-primary font-black py-3 rounded-xl hover:scale-105 hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
        >
          {loading ? '⏳ Adding...' : '✅ Add Transaction'}
        </button>
      </form>
    </div>
  );
}

export default TransactionForm;
