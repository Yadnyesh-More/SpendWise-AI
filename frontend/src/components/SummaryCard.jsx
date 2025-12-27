import React from 'react';
import { formatCurrency } from '../utils';

function SummaryCard({ icon, title, amount, color }) {
  return (
    <div className={`${color} rounded-lg p-6 text-white shadow-md`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm opacity-90">{title}</p>
          <p className="text-3xl font-bold mt-2">{formatCurrency(amount)}</p>
        </div>
        <div className="text-4xl">{icon}</div>
      </div>
    </div>
  );
}

export default SummaryCard;
