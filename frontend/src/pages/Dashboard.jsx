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
  const [hasNewAI, setHasNewAI] = useState(false);

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
      try {
        const aiRes = await api.post('/ai/budget-suggestion', {
          income: s.income,
          expense: s.expense,
          month: selectedMonth,
        });

        if (aiRes.data.success && aiRes.data.ai) {
          setAiSuggestion(aiRes.data.ai);
          if (!showAI) { // Only if AI is currently closed
            setHasNewAI(true);
          }
        } else {
          throw new Error('Invalid AI response');
        }
      } catch (aiErr) {
        // FALLBACK SMART CALCULATIONS
        const expenseRatio = s.income > 0 ? 
          ((s.expense / s.income) * 100).toFixed(0) + '%' : '0%';
        const savingsRate = s.income > 0 ? 
          (100 - parseFloat(expenseRatio)).toFixed(0) + '%' : '0%';
        
        let suggestionText, recommendation;
        const expensePercent = parseFloat(expenseRatio);
        
        if (expensePercent === 0) {
          suggestionText = "No transactions yet! Add your first income/expense.";
          recommendation = "Start tracking your finances";
        } else if (expensePercent < 50) {
          suggestionText = "🎉 Excellent! You're spending way below average!";
          recommendation = "Invest 30% in index funds 🚀";
        } else if (expensePercent < 70) {
          suggestionText = "💪 Great financial discipline!";
          recommendation = "Invest 20% in mutual funds 📈";
        } else if (expensePercent < 90) {
          suggestionText = "👌 Good job! Room to optimize.";
          recommendation = "Build 3-month emergency fund 🛡️";
        } else {
          suggestionText = "⚠️ High spending detected.";
          recommendation = "Cut dining out & subscriptions ✂️";
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
        if (!showAI) { // Only if AI is currently closed
          setHasNewAI(true);
        }
      }
    } catch (err) {
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTransactionAdded = () => {
    setRefreshKey((prev) => prev + 1);
    loadMonths();
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
      {/* Header - CLEAN (NO BADGE) */}
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

      {/* 🚀 RED BEAM BUDGET COACH - BOTTOM RIGHT */}
      {hasNewAI && (
        <div className="fixed bottom-8 right-8 z-40 md:bottom-12 md:right-12">
          <div className="relative group">
            {/* GLOWING OUTER RING */}
            <div className="absolute -inset-6 bg-gradient-to-r from-red-400/70 via-rose-500/70 to-pink-500/70 rounded-3xl blur-3xl opacity-60 animate-pulse group-hover:opacity-90"></div>
            
            {/* PINGING MIDDLE RING */}
            <div className="absolute -inset-4 bg-gradient-to-r from-red-500/60 via-rose-600/60 to-red-500/60 rounded-3xl blur-xl opacity-50 animate-ping group-hover:animate-none"></div>
            
            {/* MAIN BUTTON */}
            <button
              onClick={() => {
                setShowAI(true);
                setHasNewAI(false);
              }}
              className="relative z-10 px-8 py-5 bg-gradient-to-br from-red-600 via-rose-600 to-pink-600 
                         hover:from-red-700 hover:via-rose-700 hover:to-pink-700 
                         text-white font-black text-lg rounded-3xl shadow-2xl hover:shadow-3xl 
                         hover:scale-105 hover:rotate-3 transform transition-all duration-300
                         border-4 border-red-500/60 ring-4 ring-red-400/40 backdrop-blur-xl"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl animate-bounce">💡</span>
                <span>Budget Coach</span>
                <span className="w-3 h-3 bg-white rounded-full animate-ping ml-auto"></span>
              </div>
            </button>
            
            {/* TOOLTIP */}
            <div className="absolute -top-14 left-1/2 transform -translate-x-1/2 
                            bg-red-600/95 backdrop-blur-md text-white px-4 py-2 rounded-2xl 
                            text-sm font-bold opacity-0 group-hover:opacity-100 
                            transition-all duration-300 whitespace-nowrap shadow-2xl 
                            border border-red-400/50">
              New money tips! 💰
            </div>
          </div>
        </div>
      )}

      {/* AI ADVISOR OVERLAY */}
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
