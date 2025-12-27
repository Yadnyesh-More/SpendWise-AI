import React from 'react';
import { formatCurrency } from '../utils';
import api from '../api';

const formatDate = (value) => {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;

  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

function TransactionList({ transactions, onDelete }) {
  const handleDelete = async (id) => {
    if (window.confirm('Delete this transaction?')) {
      try {
        await api.delete(`/transactions/${id}`);
        onDelete();
      } catch (err) {
        console.error('Error:', err);
      }
    }
  };

  if (transactions.length === 0) {
    return (
      <div className="text-center py-12">
        <p style={{ color: '#8B93A7' }} className="text-sm">
          No transactions yet. Add one to get started!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {transactions.map((tx) => (
        <div
          key={tx._id}
          style={{
            backgroundColor: '#242C3B',
            borderColor: '#2E3748',
          }}
          className="border rounded-2xl p-4 flex items-center justify-between hover:bg-opacity-80 transition-all group"
        >
          {/* Left Side */}
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <span className="text-2xl">
                {tx.type === 'income' ? '📈' : '💸'}
              </span>
              <div>
                <p style={{ color: '#E6EAF2' }} className="font-semibold capitalize">
                  {tx.category}
                </p>
                <p style={{ color: '#8B93A7' }} className="text-xs">
                  {formatDate(tx.date)}
                </p>
              </div>
            </div>
          </div>

          {/* Right Side - Amount */}
          <div className="text-right">
            <p
              style={{
                color: tx.type === 'income' ? '#4CAF8F' : '#E06C75',
              }}
              className="font-black text-lg"
            >
              {tx.type === 'income' ? '+' : '-'}₹{formatCurrency(tx.amount)}
            </p>
          </div>

          {/* Delete Button */}
          <button
            onClick={() => handleDelete(tx._id)}
            style={{ color: '#E06C75' }}
            className="ml-4 hover:scale-110 transition-all text-xl opacity-0 group-hover:opacity-100"
          >
            🗑️
          </button>
        </div>
      ))}
    </div>
  );
}

export default TransactionList;
