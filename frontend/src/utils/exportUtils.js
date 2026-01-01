import Papa from 'papaparse';

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

export const exportPDF = async (month = 'all') => {
  window.open(`/api/export/pdf/${month}`, '_blank');
};

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};
