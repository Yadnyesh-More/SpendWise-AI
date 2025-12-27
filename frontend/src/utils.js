// Format currency - Single rupee symbol only
export const formatCurrency = (amount) => {
  if (!amount) return '0.00';
  
  return new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

// Format date
export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-IN');
};

// Get color for category
export const getCategoryColor = (category) => {
  const colors = {
    food: '#FF6B6B',
    transport: '#4ECDC4',
    utilities: '#45B7D1',
    entertainment: '#FFA07A',
    shopping: '#98D8C8',
    health: '#F7DC6F',
    education: '#BB8FCE',
    salary: '#85C1E2',
    freelance: '#F8B739',
    investment: '#52C39A',
    bonus: '#1ABC9C',
    gift: '#E74C3C',
    other: '#95A5A6',
  };
  return colors[category] || '#3498DB';
};
