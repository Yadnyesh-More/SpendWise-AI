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
  const [hasNewSuggestion, setHasNewSuggestion] = useState(false);
  const [isMinimized, setIsMinimized] = useState(true);
  const [isFirstLoad, setIsFirstLoad] = useState(true);

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

      try {
        const aiRes = await api.post('/ai/budget-suggestion', {
          income: s.income,
          expense: s.expense,
          month: selectedMonth,
        });

        if (aiRes.data.success && aiRes.data.ai) {
          setAiSuggestion(aiRes.data.ai);
          setHasNewSuggestion(true);
          
          if (isFirstLoad) {
            setShowAI(true);
            setIsMinimized(false);
            setIsFirstLoad(false);
          }
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
          recommendation = "Invest 30% in index funds 🚀";
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

        setHasNewSuggestion(true);
        
        if (isFirstLoad) {
          setShowAI(true);
          setIsMinimized(false);
          setIsFirstLoad(false);
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

  const handleViewInsight = () => {
    setShowAI(true);
    setIsMinimized(false);
    setHasNewSuggestion(false);
  };

  const handleMinimize = () => {
    setShowAI(false);
    setIsMinimized(true);
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
      {/* CLEAN HEADER - NO AI BUTTON */}
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

      {/* ✅ MINIMIZED BUDGET COACH - BOTTOM RIGHT WITH CONTINUOUS GLOW */}
      {aiSuggestion && isMinimized && (
        <div className="fixed bottom-6 right-6 z-40 w-80">
          <div className="group relative">
            {/* CONTINUOUS GLOW EFFECT - MATCHES YOUR DESIGN */}
            {hasNewSuggestion && (
              <>
                <div className="absolute -inset-4 bg-gradient-to-r from-cyan-400/40 via-blue-500/50 to-cyan-400/40 rounded-3xl blur-2xl animate-pulse"></div>
                <div className="absolute -inset-2 bg-gradient-to-r from-cyan-500/30 via-blue-500/40 to-cyan-500/30 rounded-3xl blur-xl opacity-90 animate-ping"></div>
                <div className="absolute -inset-1 bg-gradient-to-r from-cyan-400/20 via-blue-400/30 to-cyan-400/20 rounded-3xl blur-lg"></div>
              </>
            )}

            {/* MAIN CARD */}
            <div className="relative bg-gradient-to-br from-slate-800/95 via-slate-900/95 to-slate-950/95 backdrop-blur-xl border-2 border-cyan-500/40 rounded-3xl p-6 shadow-2xl hover:shadow-cyan-500/25 hover:border-cyan-500/60 transition-all group-hover:scale-[1.02]">
              {/* HEADER */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg border-2 border-white/20">
                    <span className="text-2xl">🤖</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-white">Budget Coach</h3>
                    <p className="text-cyan-300 text-xs font-semibold mt-0.5">AI-Powered Insights</p>
                  </div>
                </div>
                <button
                  onClick={() => setAiSuggestion(null)}
                  className="w-8 h-8 rounded-xl bg-slate-800/50 hover:bg-slate-700 border border-slate-600/50 hover:border-slate-500 flex items-center justify-center text-slate-400 hover:text-white transition-all text-sm font-bold flex-shrink-0"
                  title="Close"
                >
                  ✕
                </button>
              </div>

              {/* DIVIDER */}
              <div className="h-px bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent my-3"></div>

              {/* SUGGESTION */}
              <p className="text-white/90 text-sm leading-relaxed line-clamp-2 mb-4">
                {aiSuggestion.suggestion}
              </p>

              {/* MAXIMIZE BUTTON */}
              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={handleViewInsight}
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-bold rounded-xl text-sm shadow-lg hover:shadow-cyan-500/25 transition-all flex items-center justify-center border border-cyan-400/50"
                >
                  <span className="text-lg mr-1">⬆</span>
                  Maximize
                </button>
              </div>

              {/* BOTTOM TEXT */}
              {hasNewSuggestion && (
                <p className="text-xs text-cyan-400/70 mt-3 text-center font-medium">
                  🔄 Updates after every transaction
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ✅ MAXIMIZED VIEW - FULL SCREEN MODAL */}
      {showAI && aiSuggestion && !isMinimized && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-6">
          <div className="w-full max-w-md max-h-[90vh] overflow-hidden">
            {/* GLOW BORDER */}
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/40 via-blue-500/50 to-cyan-500/40 rounded-3xl blur-xl"></div>
            
            <div className="relative bg-gradient-to-br from-slate-800/95 via-slate-900/95 to-slate-950/95 backdrop-blur-xl border-4 border-cyan-500/50 rounded-3xl p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
              {/* HEADER */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-xl border-2 border-white/30">
                    <span className="text-3xl">🤖</span>
                  </div>
                  <div>
                    <h2 className="text-3xl font-black text-white">Budget Coach</h2>
                    <p className="text-cyan-300 text-sm font-semibold mt-1">AI-Powered Insights</p>
                  </div>
                </div>
                
                {/* MINIMIZE BUTTON */}
                <button
                  onClick={handleMinimize}
                  className="w-12 h-12 rounded-2xl bg-slate-800/60 hover:bg-slate-700 border-2 border-slate-600/50 hover:border-slate-500 flex items-center justify-center text-slate-300 hover:text-white transition-all font-bold text-xl shadow-lg hover:shadow-cyan-500/20"
                  title="Minimize"
                >
                  ⬇
                </button>
              </div>

              {/* CONTENT */}
              <div className="space-y-6">
                <p className="text-white text-lg leading-relaxed text-center">
                  {aiSuggestion.suggestion}
                </p>

                {aiSuggestion.metrics && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gradient-to-br from-red-500/20 to-red-600/20 border-2 border-red-400/40 rounded-2xl p-5 text-center backdrop-blur-sm">
                      <p className="text-red-300 text-xs font-bold uppercase tracking-wide">Expense Ratio</p>
                      <p className="text-red-100 text-3xl font-black mt-1">{aiSuggestion.metrics.expenseRatio}</p>
                    </div>
                    <div className="bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 border-2 border-emerald-400/40 rounded-2xl p-5 text-center backdrop-blur-sm">
                      <p className="text-emerald-300 text-xs font-bold uppercase tracking-wide">Savings Rate</p>
                      <p className="text-emerald-100 text-3xl font-black mt-1">{aiSuggestion.metrics.savingsPercentage}</p>
                    </div>
                  </div>
                )}

                {aiSuggestion.recommendation && (
                  <div className="bg-gradient-to-r from-cyan-500/30 via-blue-500/30 to-cyan-500/30 border-2 border-cyan-400/50 rounded-2xl p-6 text-center backdrop-blur-sm">
                    <p className="text-cyan-100 text-xl font-bold leading-relaxed">
                      {aiSuggestion.recommendation}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
