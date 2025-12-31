import React, { useEffect, useState } from 'react';
import { formatCurrency } from '../utils';
import TransactionForm from '../components/TransactionForm';
import TransactionList from '../components/TransactionList';
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
  const [coachGlow, setCoachGlow] = useState(false);

  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    loadMonths();
  }, []);

  useEffect(() => {
    loadDashboard();
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

      const s = summaryRes.data.summary || { income: 0, expense: 0, balance: 0 };
      setSummary(s);
      setTransactions(txRes.data.transactions || []);

      // AI CALCULATIONS
      try {
        const aiRes = await api.post('/ai/budget-suggestion', {
          income: s.income,
          expense: s.expense,
          month: selectedMonth,
        });

        if (aiRes.data.success && aiRes.data.ai) {
          setAiSuggestion(aiRes.data.ai);
        }
      } catch (aiErr) {
        const expenseRatio = s.income > 0 ? 
          ((s.expense / s.income) * 100).toFixed(0) + '%' : '0%';
        const savingsRate = s.income > 0 ? 
          (100 - parseFloat(expenseRatio)).toFixed(0) + '%' : '0%';
        
        let suggestionText, recommendation;
        const expensePercent = parseFloat(expenseRatio);
        
        if (expensePercent === 0) {
          suggestionText = "No transactions yet!";
          recommendation = "Start tracking your finances";
        } else if (expensePercent < 50) {
          suggestionText = "🎉 Excellent spending habits!";
          recommendation = "Invest 30% 🚀";
        } else if (expensePercent < 70) {
          suggestionText = "💪 Great discipline!";
          recommendation = "Invest 20% 📈";
        } else if (expensePercent < 90) {
          suggestionText = "👌 Good job!";
          recommendation = "Build emergency fund 🛡️";
        } else {
          suggestionText = "⚠️ High spending!";
          recommendation = "Cut subscriptions ✂️";
        }

        setAiSuggestion({
          suggestion: suggestionText,
          metrics: { expenseRatio, savingsPercentage: savingsRate },
          recommendation
        });
      }

      // SOFT GLOW on coach
      setCoachGlow(true);
      setTimeout(() => setCoachGlow(false), 3000);

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

  const expensePercentage = summary.income > 0
    ? ((summary.expense / summary.income) * 100).toFixed(1)
    : 0;

  const statsCards = [
    {
      label: 'Income', value: summary.income, icon: '📈',
      gradient: 'from-emerald-500 to-teal-500', darkGradient: 'from-emerald-600/20 to-teal-600/20',
      borderColor: 'border-emerald-400/50', textColor: 'text-emerald-300',
    },
    {
      label: 'Expenses', value: summary.expense, icon: '💸',
      gradient: 'from-red-500 to-pink-500', darkGradient: 'from-red-600/20 to-pink-600/20',
      borderColor: 'border-red-400/50', textColor: 'text-red-300',
    },
    {
      label: 'Balance', value: summary.balance, icon: '💎',
      gradient: 'from-blue-500 to-cyan-500', darkGradient: 'from-blue-600/20 to-cyan-600/20',
      borderColor: 'border-blue-400/50', textColor: 'text-blue-300',
    },
    {
      label: 'Spend Rate', value: `${expensePercentage}%`, icon: '📊',
      gradient: 'from-orange-500 to-yellow-500', darkGradient: 'from-orange-600/20 to-yellow-600/20',
      borderColor: 'border-orange-400/50', textColor: 'text-orange-300',
    },
  ];

  return (
    <div className="min-h-screen bg-dark-primary">
      {/* HEADER - CLEAN */}
      <div className="sticky top-16 z-30 bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 backdrop-blur-xl border-b-2 border-white/20 shadow-xl">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center justify-between">
            <div>
              <h1 className="text-5xl font-black text-white drop-shadow-lg">Dashboard</h1>
              <p className="text-white/80 text-sm font-semibold mt-1 drop-shadow-md">
                {selectedMonth === 'all'
                  ? '📊 All Time Summary'
                  : `📅 ${new Date(selectedMonth + '-01').toLocaleString('default', { month: 'long', year: 'numeric' })}`}
              </p>
            </div>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-6 py-3 bg-white/20 border-2 border-white text-white rounded-xl font-bold focus:ring-2 focus:ring-white/50 cursor-pointer backdrop-blur-sm hover:bg-white/30 transition-all"
            >
              <option value="all" style={{ backgroundColor: '#191F2B', color: '#E6EAF2' }}>📊 All Time</option>
              {months.map((month) => (
                <option key={month} value={month} style={{ backgroundColor: '#191F2B', color: '#E6AF2' }}>
                  {new Date(month + '-01').toLocaleString('default', { month: 'long', year: 'numeric' })}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {statsCards.map((card, idx) => (
            <div key={idx} className={`bg-dark-surface border-2 ${card.borderColor} rounded-3xl p-7 shadow-lg hover:shadow-2xl hover:scale-105 transition-all overflow-hidden relative group`}>
              <div className={`absolute top-0 right-0 w-40 h-40 bg-gradient-to-br ${card.gradient} opacity-10 rounded-full blur-3xl group-hover:opacity-20 transition-opacity`}></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-4xl">{card.icon}</span>
                  <span className={`text-xs font-black uppercase bg-gradient-to-r ${card.gradient} text-white px-3 py-1.5 rounded-full`}>{card.label}</span>
                </div>
                <div className={`bg-gradient-to-br ${card.darkGradient} backdrop-blur-sm border border-white/10 rounded-2xl px-4 py-3 mt-2`}>
                  <h3 className={`text-3xl font-black ${card.textColor} drop-shadow-lg`}>
                    {card.label === 'Spend Rate' ? card.value : `₹${formatCurrency(card.value || 0)}`}
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
              <TransactionList transactions={transactions} onDelete={handleTransactionAdded} />
            </div>
          </div>
        </div>
      </div>

      {/* 🚀 MINIMIZED BUDGET COACH + SOFT THEME GLOW */}
      <div className="fixed bottom-6 right-6 z-40 md:bottom-8 md:right-8 lg:bottom-12 lg:right-12">
        <div className="relative group">
          {/* SOFT THEME GLOW - CYAN/BLUE matching website */}
          {coachGlow && (
            <>
              <div className="absolute -inset-8 bg-gradient-to-r from-cyan-400/60 via-blue-500/70 to-cyan-400/60 rounded-3xl blur-2xl opacity-70 animate-pulse"></div>
              <div className="absolute -inset-6 bg-gradient-to-r from-blue-500/50 via-cyan-500/60 to-blue-500/50 rounded-3xl blur-xl opacity-60 animate-pulse animation-delay-200"></div>
            </>
          )}
          
          {/* MINIMIZED COACH BUTTON */}
          <button
            onClick={() => setShowAI(true)}
            className={`relative z-10 w-20 h-20 rounded-3xl shadow-2xl hover:shadow-3xl hover:scale-110 transform transition-all duration-300 flex items-center justify-center backdrop-blur-xl border-4 font-bold text-sm cursor-pointer
              ${coachGlow 
                ? 'bg-gradient-to-br from-cyan-600 via-blue-600 to-cyan-600 border-cyan-400/70 ring-4 ring-cyan-400/50 animate-pulse'
                : 'bg-gradient-to-br from-purple-600 via-pink-600 to-purple-600 border-purple-500/50 hover:border-cyan-400/70 ring-2 ring-purple-500/30 hover:ring-cyan-400/50 hover:bg-gradient-to-br hover:from-cyan-600 hover:via-blue-600 hover:to-cyan-600'
              }`}
            title="Budget Coach"
          >
            <div className="flex flex-col items-center gap-1">
              <span className="text-2xl">🤖</span>
              <span>Coach</span>
            </div>
          </button>
          
          {/* TOOLTIP */}
          <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-gray-900/95 backdrop-blur-md text-white px-4 py-2 rounded-2xl text-xs font-bold opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap shadow-2xl border border-gray-700/50 pointer-events-none">
            Budget Coach
          </div>
        </div>
      </div>

      {/* 🎯 AI ADVISOR - MINIMIZED DISPLAY (LIKE YOUR PHOTO) */}
      {aiSuggestion && !showAI && (
        <div className="fixed bottom-32 right-6 z-40 md:bottom-36 md:right-8 lg:bottom-40 lg:right-12 w-80 sm:w-96">
          <div className="relative group">
            {/* SOFT CYAN BORDER GLOW ANIMATION */}
            <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/40 via-blue-500/40 to-cyan-500/40 rounded-3xl blur-md opacity-0 group-hover:opacity-100 transition-all duration-500 animate-pulse"></div>
            
            {/* MAIN AI ADVISOR CARD */}
            <div className="relative bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 border-2 border-cyan-500/30 rounded-3xl p-6 shadow-2xl backdrop-blur-xl">
              {/* HEADER */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 via-pink-500 to-purple-600 rounded-2xl flex items-center justify-center text-2xl shadow-lg">
                    🤖
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-white">Budget Coach</h3>
                    <p className="text-cyan-300 text-xs font-semibold">AI-Powered Insights</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAI(true)}
                  className="w-10 h-10 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/40 border border-cyan-400/30 hover:border-cyan-400/60 flex items-center justify-center text-cyan-300 hover:text-cyan-200 transition-all font-bold"
                  title="Maximize"
                >
                  ⬆
                </button>
              </div>

              {/* DIVIDER */}
              <div className="h-px bg-gradient-to-r from-cyan-500/0 via-cyan-500/30 to-cyan-500/0 mb-4"></div>

              {/* SUGGESTION */}
              <p className="text-white text-sm leading-relaxed mb-4">
                {aiSuggestion.suggestion}
              </p>

              {/* METRICS */}
              {aiSuggestion.metrics && (
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-cyan-500/10 border border-cyan-400/20 rounded-xl p-3">
                    <p className="text-cyan-300 text-xs font-bold uppercase">Expense Ratio</p>
                    <p className="text-cyan-100 text-lg font-black">{aiSuggestion.metrics.expenseRatio}</p>
                  </div>
                  <div className="bg-blue-500/10 border border-blue-400/20 rounded-xl p-3">
                    <p className="text-blue-300 text-xs font-bold uppercase">Savings</p>
                    <p className="text-blue-100 text-lg font-black">{aiSuggestion.metrics.savingsPercentage}</p>
                  </div>
                </div>
              )}

              {/* RECOMMENDATION */}
              {aiSuggestion.recommendation && (
                <div className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-400/30 rounded-2xl p-4">
                  <p className="text-cyan-200 text-sm font-bold">{aiSuggestion.recommendation}</p>
                </div>
              )}

              {/* CLOSE BUTTON */}
              <button
                onClick={() => setAiSuggestion(null)}
                className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-slate-700/50 hover:bg-slate-600 border border-slate-600 hover:border-slate-500 flex items-center justify-center text-white/70 hover:text-white transition-all font-bold text-lg"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FULL SCREEN AI ADVISOR MODAL - MAXIMIZED */}
      {showAI && aiSuggestion && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-2xl max-h-96 overflow-auto">
            {/* SOFT CYAN BORDER GLOW */}
            <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/50 via-blue-500/50 to-cyan-500/50 rounded-3xl blur-lg opacity-100 animate-pulse"></div>
            
            {/* MAIN MODAL */}
            <div className="relative bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 border-2 border-cyan-500/50 rounded-3xl p-8 shadow-2xl backdrop-blur-xl">
              {/* HEADER */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-start gap-4">
                  <div className="w-20 h-20 bg-gradient-to-br from-purple-500 via-pink-500 to-purple-600 rounded-2xl flex items-center justify-center text-4xl shadow-lg">
                    🤖
                  </div>
                  <div>
                    <h2 className="text-3xl font-black text-white">Budget Coach</h2>
                    <p className="text-cyan-300 text-sm font-semibold">AI-Powered Insights</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAI(false)}
                  className="w-12 h-12 rounded-xl bg-slate-700/50 hover:bg-slate-600 border border-slate-600 hover:border-slate-500 flex items-center justify-center text-white/70 hover:text-white transition-all font-bold text-2xl"
                >
                  ✕
                </button>
              </div>

              {/* DIVIDER */}
              <div className="h-px bg-gradient-to-r from-cyan-500/0 via-cyan-500/50 to-cyan-500/0 mb-6"></div>

              {/* SUGGESTION */}
              <p className="text-white text-lg leading-relaxed mb-6">
                {aiSuggestion.suggestion}
              </p>

              {/* METRICS */}
              {aiSuggestion.metrics && (
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-cyan-500/20 border border-cyan-400/40 rounded-2xl p-4">
                    <p className="text-cyan-300 text-sm font-bold uppercase">Expense Ratio</p>
                    <p className="text-cyan-100 text-3xl font-black">{aiSuggestion.metrics.expenseRatio}</p>
                  </div>
                  <div className="bg-blue-500/20 border border-blue-400/40 rounded-2xl p-4">
                    <p className="text-blue-300 text-sm font-bold uppercase">Savings Rate</p>
                    <p className="text-blue-100 text-3xl font-black">{aiSuggestion.metrics.savingsPercentage}</p>
                  </div>
                </div>
              )}

              {/* RECOMMENDATION */}
              {aiSuggestion.recommendation && (
                <div className="bg-gradient-to-r from-cyan-500/30 to-blue-500/30 border border-cyan-400/50 rounded-2xl p-6">
                  <p className="text-cyan-100 text-lg font-bold">{aiSuggestion.recommendation}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
