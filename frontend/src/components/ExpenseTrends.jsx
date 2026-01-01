import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import api from '../api';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const ExpenseTrends = ({ userId }) => {
  const [trends, setTrends] = useState([]);
  const [period, setPeriod] = useState('30d');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrends();
  }, [period]);

  const fetchTrends = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/api/analytics/trends/${period}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setTrends(res.data.trends);
    } catch (error) {
      console.error('Trends error:', error);
    } finally {
      setLoading(false);
    }
  };

  const data = {
    labels: trends.map(t => new Date(t.date).toLocaleDateString()),
    datasets: [{
      label: 'Expenses (₹)',
      data: trends.map(t => t.total),
      borderColor: 'rgb(239, 68, 68)',
      backgroundColor: 'rgba(239, 68, 68, 0.1)',
      tension: 0.4,
      fill: true
    }]
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: `${period.toUpperCase()} Expense Trends` }
    },
    scales: {
      y: { beginAtZero: true }
    }
  };

  return (
    <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-black text-white">📈 Expense Trends</h3>
        <div className="flex gap-2">
          <button 
            onClick={() => setPeriod('7d')} 
            className={`px-4 py-2 rounded-xl font-bold transition-all ${period === '7d' ? 'bg-blue-500 text-white' : 'bg-white/20 text-white hover:bg-white/30'}`}
          >
            7D
          </button>
          <button 
            onClick={() => setPeriod('30d')} 
            className={`px-4 py-2 rounded-xl font-bold transition-all ${period === '30d' ? 'bg-blue-500 text-white' : 'bg-white/20 text-white hover:bg-white/30'}`}
          >
            30D
          </button>
          <button 
            onClick={() => setPeriod('90d')} 
            className={`px-4 py-2 rounded-xl font-bold transition-all ${period === '90d' ? 'bg-blue-500 text-white' : 'bg-white/20 text-white hover:bg-white/30'}`}
          >
            90D
          </button>
        </div>
      </div>
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="h-80">
          <Line data={data} options={options} />
        </div>
      )}
    </div>
  );
};

export default ExpenseTrends;
