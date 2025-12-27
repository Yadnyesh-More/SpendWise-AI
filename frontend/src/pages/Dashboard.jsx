import React, { useEffect, useState } from 'react';
import { formatCurrency } from '../utils';
import TransactionForm from '../components/TransactionForm';
import TransactionList from '../components/TransactionList';
import AIAdvisor from '../components/AIAdvisor.jsx';
import LoadingSpinner from '../components/LoadingSpinner';
import api from '../api';

function Dashboard({ user }) {
  const [summary, setSummary] = useState({
    income: 0,
    expense: 0,
    balance: 0,
  });
  const [transactions, setTransactions] = useState([]);
  const [months, setMonths] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState('all');

  const [aiSuggestion, setAiSuggestion] = useState(null);
  const [showAI, setShowAI] = useState(false);

  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  // Load list of months once
  useEffect(() => {
    loadMonths();
  }, []);

  // Load dashboard when month changes or refreshKey increments
  useEffect(() => {
    loadDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMonth, refreshKey]);

  const loadMonths = async () => {
    try {
      const res = await api.get('/transactions/months/list');
      if (res.data.success) {
        setMonths(res.data.months);
        if (res.data.months.length > 0) {
          setSelectedMonth(res.data.months[0]);
        }
      }
    } catch (err) {
      console.error('Error loading months:', err);
    }
  };

  const loadDashboard = async () => {
    try {
      setLoading(true);

      const [summaryRes, txRes] = await Promise.all([
        api.get(`/transactions/summary?month=${selectedMonth}`),
        api.get(`/transactions?month=${selectedMonth}`),
      ]);

      const s = summaryRes.data.summary || {
        income: 0,
        expense: 0,
        balance: 0,
      };

      setSummary(s);
      setTransactions(txRes.data.transactions || []);

      // DYNAMIC AI CALCULATIONS + Backend call
      console.log('🔄 Calculating AI insights...');
      
      try {
        const aiRes = await api.post('/ai/budget-suggestion', {
          income: s.income,
          expense: s.expense,
          month: selectedMonth,
        });

        console.log('✅ Backend AI response:', aiRes.data);

        if (aiRes.data.success && aiRes.data.ai) {
          setAiSuggestion(aiRes.data.ai);
        } else {
          throw new Error('Invalid AI response');
        }
      } catch (aiErr) {
        console.log('⚠️ Backend failed, using smart calculations');
        
        // DYNAMIC SMART CALCULATIONS
        const expenseRatio = s.income > 0 ? 
          ((s.expense / s.income) * 100).toFixed(0) + '%' : '0%';
        const savingsRate = s.income > 0 ? 
          (100 - parseFloat(expenseRatio)).toFixed(0) + '%' : '0%';
        
        let suggestionText, recommendation;
        
        const expensePercent = parseFloat(expenseRatio);
        
        if (expensePercent === 0) {
          suggestionText = "No transactions yet! Add your first income/expense to get personalized advice.";
          recommendation = "Start tracking your finances";
        } else if (expensePercent < 50) {
          suggestionText = "🎉 Excellent! You're spending way below average. You're building serious wealth!";
          recommendation = "Invest 30% in index funds 🚀";
        } else if (expensePercent < 70) {
          suggestionText = "💪 Great financial discipline! You're saving more than most people.";
          recommendation = "Invest 20% in mutual funds 📈";
        } else if (expensePercent < 90) {
          suggestionText = "👌 Good job! Room to optimize spending habits for better savings.";
          recommendation = "Build 3-month emergency fund 🛡️";
        } else {
          suggestionText = "⚠️ High spending detected. Review discretionary expenses to boost savings.";
          recommendation = "Cut dining out & subscriptions first ✂️";
        }

        const aiData = {
          suggestion: suggestionText,
          metrics: {
            expenseRatio,
            savingsPercentage: savingsRate
          },
          recommendation
        };

        setAiSuggestion(aiData);
      }

      // ALWAYS SHOW AI (maximized)
      setShowAI(true);
      console.log('✅ AI Advisor SHOWING with:', aiSuggestion);

    } catch (err) {
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTransactionAdded = () => {
    console.log('🆕 Transaction added - refreshing AI...');
    setRefreshKey((prev) => prev + 1);
    loadMonths();
    // AI will auto-maximize in AIAdvisor useEffect
  };

  if (loading && months.length === 0) {
    return <LoadingSpinner />;
  }

  const expensePercentage =
    summary.income > 0
      ? ((summary.expense / summary.income) * 100).toFixed(1)
      : 0;

  const statsCards = [
    {
      label: 'Income',
      value: summary.income,
      icon: '📈',
      gradient: 'from-emerald-500 to-teal-500',
      darkGradient: 'from-emerald-600/20 to-teal-600/20',
      borderColor: 'border-emerald-400/50',
      textColor: 'text-emerald-300',
    },
    {
      label: 'Expenses',
      value: summary.expense,
      icon: '💸',
      gradient: 'from-red-500 to-pink-500',
      darkGradient: 'from-red-600/20 to-pink-600/20',
      borderColor: 'border-red-400/50',
      textColor: 'text-red-300',
    },
    {
      label: 'Balance',
      value: summary.balance,
      icon: '💎',
      gradient: 'from-blue-500 to-cyan-500',
      darkGradient: 'from-blue-600/20 to-cyan-600/20',
      borderColor: 'border-blue-400/50',
      textColor: 'text-blue-300',
    },
    {
      label: 'Spend Rate',
      value: `${expensePercentage}%`,
      icon: '📊',
      gradient: 'from-orange-500 to-yellow-500',
      darkGradient: 'from-orange-600/20 to-yellow-600/20',
      borderColor: 'border-orange-400/50',
      textColor: 'text-orange-300',
    },
  ];

  return (
    <div className="min-h-screen bg-dark-primary">
      {/* Header */}
      <div className="sticky top-16 z-30 bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 backdrop-blur-xl border-b-2 border-white/20 shadow-xl">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center justify-between">
            <div>
              <h1 className="text-5xl font-black text-white drop-shadow-lg">
                Dashboard
              </h1>
              <p className="text-white/80 text-sm font-semibold mt-1 drop-shadow-md">
                {selectedMonth === 'all'
                  ? '📊 All Time Summary'
                  : `📅 ${new Date(
                      selectedMonth + '-01'
                    ).toLocaleString('default', {
                      month: 'long',
                      year: 'numeric',
                    })}`}
              </p>
            </div>

            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-6 py-3 bg-white/20 border-2 border-white text-white rounded-xl font-bold focus:ring-2 focus:ring-white/50 cursor-pointer backdrop-blur-sm hover:bg-white/30 transition-all"
            >
              <option value="all" style={{ backgroundColor: '#191F2B', color: '#E6EAF2' }}>
                📊 All Time
              </option>
              {months.map((month) => (
                <option
                  key={month}
                  value={month}
                  style={{ backgroundColor: '#191F2B', color: '#E6AF2' }}
                >
                  {new Date(month + '-01').toLocaleString('default', {
                    month: 'long',
                    year: 'numeric',
                  })}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {statsCards.map((card, idx) => (
            <div
              key={idx}
              className={`bg-dark-surface border-2 ${card.borderColor} rounded-3xl p-7 shadow-lg hover:shadow-2xl hover:scale-105 transition-all overflow-hidden relative group`}
            >
              <div
                className={`absolute top-0 right-0 w-40 h-40 bg-gradient-to-br ${card.gradient} opacity-10 rounded-full blur-3xl group-hover:opacity-20 transition-opacity`}
              ></div>

              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-4xl">{card.icon}</span>
                  <span
                    className={`text-xs font-black uppercase bg-gradient-to-r ${card.gradient} text-white px-3 py-1.5 rounded-full`}
                  >
                    {card.label}
                  </span>
                </div>

                <div
                  className={`bg-gradient-to-br ${card.darkGradient} backdrop-blur-sm border border-white/10 rounded-2xl px-4 py-3 mt-2`}
                >
                  <h3
                    className={`text-3xl font-black ${card.textColor} drop-shadow-lg`}
                  >
                    {card.label === 'Spend Rate'
                      ? card.value
                      : `₹${formatCurrency(card.value || 0)}`}
                  </h3>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Form + List */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <TransactionForm onTransactionAdded={handleTransactionAdded} />
          </div>

          <div className="lg:col-span-2">
            <div className="bg-dark-surface border-2 border-blue-400/50 rounded-3xl p-8 shadow-lg backdrop-blur-sm">
              <div className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-2xl px-4 py-3 mb-6 border border-blue-400/30">
                <h2 className="text-2xl font-black text-blue-300 flex items-center gap-3">
                  <span className="text-3xl">📋</span> Recent Transactions
                  <span className="text-sm bg-blue-500/30 text-blue-200 px-3 py-1 rounded-full font-semibold border border-blue-400/50">
                    {transactions.length}
                  </span>
                </h2>
              </div>
              <TransactionList
                transactions={transactions}
                onDelete={handleTransactionAdded}
              />
            </div>
          </div>
        </div>
      </div>

      {/* AI ADVISOR OVERLAY - AUTO-MAXIMIZES AFTER TRANSACTIONS */}
      {showAI && aiSuggestion && (
        <AIAdvisor
          suggestion={aiSuggestion}
          onDismiss={() => setShowAI(false)}
        />
      )}
    </div>
  );
}

export default Dashboard;
