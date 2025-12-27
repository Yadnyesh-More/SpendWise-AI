import React, { useEffect, useState } from 'react';
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import api from '../api';
import LoadingSpinner from '../components/LoadingSpinner';
import { formatCurrency } from '../utils';

const COLORS = ['#5B8CFF', '#3FC1A4', '#4CAF8F', '#D9A441', '#E06C75', '#6FA8FF', '#FF6B9D', '#50C878'];

function Analytics() {
  const [data, setData] = useState({ monthly: [], categories: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const res = await api.get('/transactions/analytics');
      if (res.data.success) {
        // 🔹 Fix categories data to ensure name field exists
        const fixedCategories = res.data.categories.map(cat => ({
          name: cat.name || cat.category || cat._id || 'Other',
          value: cat.value || 0
        }));
        setData({
          monthly: res.data.monthly || [],
          categories: fixedCategories
        });
      }
    } catch (err) {
      console.error('Analytics error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  const totalSpend = data.categories.reduce((sum, cat) => sum + cat.value, 0);
  const avgMonthlySpend = data.monthly.length > 0
    ? (data.monthly.reduce((sum, m) => sum + m.expense, 0) / data.monthly.length).toFixed(0)
    : 0;

  // 🔹 Custom Tooltip for Pie Chart
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#191F2B] border-2 border-[#2E3748] rounded-xl p-4 shadow-2xl text-[#E6EAF2] min-w-[140px]">
          <p className="font-semibold text-sm mb-2 capitalize border-b border-white/20 pb-1">
            {payload[0].payload.name || 'Category'}
          </p>
          <p className="text-xl font-black">₹{formatCurrency(payload[0].payload.value)}</p>
        </div>
      );
    }
    return null;
  };

  // 🔹 Debug data (remove after testing)
  console.log('🧁 Pie data:', data.categories);

  return (
    <div className="min-h-screen bg-dark-primary">
      {/* Header with Gradient Background */}
      <div className="sticky top-16 z-30 bg-gradient-to-r from-purple-600 via-pink-500 to-purple-600 backdrop-blur-xl border-b-2 border-white/20 shadow-xl">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <h1 className="text-5xl font-black text-white drop-shadow-lg">📊 Analytics</h1>
          <p className="text-white/80 text-sm font-semibold mt-1 drop-shadow-md">Visualize your spending patterns</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {[
            { label: 'Total Spending', value: totalSpend, icon: '💰', gradient: 'from-purple-500 to-pink-500', darkGradient: 'from-purple-600/20 to-pink-600/20', borderColor: 'border-purple-400/50', textColor: 'text-purple-300' },
            { label: 'Average/Month', value: avgMonthlySpend, icon: '📈', gradient: 'from-indigo-500 to-purple-500', darkGradient: 'from-indigo-600/20 to-purple-600/20', borderColor: 'border-indigo-400/50', textColor: 'text-indigo-300' },
            { label: 'Top Category', value: data.categories.length > 0 ? data.categories[0].name : 'N/A', icon: '🎯', gradient: 'from-pink-500 to-rose-500', darkGradient: 'from-pink-600/20 to-rose-600/20', borderColor: 'border-pink-400/50', textColor: 'text-pink-300' }
          ].map((card, idx) => (
            <div key={idx} className={`bg-dark-surface border-2 ${card.borderColor} rounded-3xl p-7 shadow-lg hover:shadow-2xl hover:scale-105 transition-all overflow-hidden relative group`}>
              <div className={`absolute top-0 right-0 w-40 h-40 bg-gradient-to-br ${card.gradient} opacity-10 rounded-full blur-3xl group-hover:opacity-20 transition-opacity`}></div>
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-4xl">{card.icon}</span>
                  <span className={`text-xs font-black uppercase bg-gradient-to-r ${card.gradient} text-white px-3 py-1.5 rounded-full`}>
                    {card.label}
                  </span>
                </div>

                <div className={`bg-gradient-to-br ${card.darkGradient} backdrop-blur-sm border border-white/10 rounded-2xl px-4 py-3 mt-2`}>
                  <h3 className={`text-3xl font-black ${card.textColor} drop-shadow-lg`}>
                    {card.label === 'Average/Month' ? `₹${formatCurrency(card.value)}` : 
                     card.label === 'Total Spending' ? `₹${formatCurrency(card.value)}` : 
                     card.value}
                  </h3>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Monthly Trend */}
          <div className="bg-dark-surface border-2 border-indigo-400/50 rounded-3xl p-8 shadow-lg">
            <div className="bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-2xl px-4 py-3 mb-6 border border-indigo-400/30">
              <h2 className="text-2xl font-black text-indigo-300">📈 Monthly Trend</h2>
            </div>
            {data.monthly.length > 0 ? (
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={data.monthly}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(46, 55, 72, 0.5)" />
                  <XAxis dataKey="month" stroke="#B6BDCC" />
                  <YAxis stroke="#B6BDCC" />
                  <Tooltip contentStyle={{ backgroundColor: '#191F2B', border: '1px solid #2E3748', borderRadius: '8px' }} />
                  <Legend />
                  <Line type="monotone" dataKey="income" stroke="#4CAF8F" strokeWidth={3} />
                  <Line type="monotone" dataKey="expense" stroke="#E06C75" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-text-muted text-center py-16">No data</p>
            )}
          </div>

          {/* Spending by Category - ✅ FIXED */}
          <div className="bg-dark-surface border-2 border-pink-400/50 rounded-3xl p-8 shadow-lg">
            <div className="bg-gradient-to-r from-pink-500/20 to-rose-500/20 rounded-2xl px-4 py-3 mb-6 border border-pink-400/30">
              <h2 className="text-2xl font-black text-pink-300">🎯 Spending by Category</h2>
            </div>
            {data.categories.length > 0 ? (
              <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                  <Pie 
                    data={data.categories} 
                    cx="50%" 
                    cy="50%" 
                    outerRadius={100}
                    dataKey="value" 
                    nameKey="name"
                  >
                    {data.categories.map((_, idx) => (
                      <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-text-muted text-center py-16">No data</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Analytics;
