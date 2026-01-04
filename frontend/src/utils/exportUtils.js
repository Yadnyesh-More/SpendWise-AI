import Papa from 'papaparse';

// Backend API base URL (your Render backend)
const API_BASE = 'https://spendwise-ai-9fd1.onrender.com';

// CSV Export - Client-side (your existing code - PERFECT)
export const exportCSV = (transactions, filename = 'transactions.csv') => {
  const csvData = transactions.map(tx => ({
    Date: new Date(tx.date).toLocaleDateString(),
    Amount: tx.amount,
    Type: tx.type === 1 ? 'Expense' : 'Income',
    Category: tx.category || 'Uncategorized',
    Description: tx.description,
    Merchant: tx.merchant || ''
  }));

  const csv = Papa.unparse(csvData);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// PDF Export - Backend API call (FIXED URL)
export const exportPDF = async (month = 'all') => {
  try {
    // Call your Render backend directly
    const url = `${API_BASE}/api/export/pdf/${month}`;
    window.open(url, '_blank');
  } catch (error) {
    console.error('PDF export failed:', error);
    alert('PDF export failed. Backend might be busy.');
  }
};

// Backend CSV Export - Alternative (if you want server-side CSV too)
export const exportCSVBackend = async (month = 'all') => {
  try {
    const url = `${API_BASE}/api/export/csv/${month}`;
    window.open(url, '_blank');
  } catch (error) {
    console.error('CSV backend export failed:', error);
  }
};

// Currency formatter (unchanged)
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};
