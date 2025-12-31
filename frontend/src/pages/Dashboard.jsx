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
  const [glowTimeout, setGlowTimeout] = useState(null);
  const [isMinimized, setIsMinimized] = useState(true);

  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    loadMonths();
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [selectedMonth, refreshKey]);

  useEffect(() => {
    return () => {
      if (glowTimeout) clearTimeout(glowTimeout);
    };
  }, [glowTimeout]);

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
    
    // Glow mini AI advisor for 4 seconds
    setHasNewSuggestion(true);
    if (glowTimeout) clearTimeout(glowTimeout);
    const timeout = setTimeout(() => {
      setHasNewSuggestion(false);
    }, 4000);
    setGlowTimeout(timeout);
  };

  const handleViewInsight = () => {
    setShowAI(true);
    setIsMinimized(false);
    setHasNewSuggestion(false);
    if (glowTimeout) clearTimeout(glowTimeout);
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
      {/* CLEAN HEADER - ABSOLUTELY NO AI BUTTONS */}
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

      {/* MINI AI ADVISOR - BOTTOM RIGHT (ONLY ⬆ BUTTON - CLICK TO MAXIMIZE) */}
      {aiSuggestion && isMinimized && (
        <div className="fixed bottom-8 right-8 z-40 w-80">
          <div className="relative">
            {/* GLOW FOR 4 SECONDS AFTER TRANSACTION */}
            {hasNewSuggestion && (
              <>
                <div className="absolute -inset-3 bg-gradient-to-r from-purple-400/40 via-pink-400/50 to-purple-400/40 rounded-3xl blur-2xl animate-ping"></div>
                <div className="absolute -inset-1.5 bg-gradient-to-r from-purple-500/30 via-pink-500/40 to-purple-500/30 rounded-3xl blur-xl animate-pulse"></div>
              </>
            )}

          </div>
        </div>
      )}

      {/* MAXIMIZED AI ADVISOR - FULL SCREEN (FROM ⬆ BUTTON ONLY) */}
      {showAI && aiSuggestion && !isMinimized && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-6">
          <div className="w-full max-w-5xl max-h-[95vh] relative">
            {/* BACKGROUND GRADIENT */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-900/30 via-pink-900/20 to-purple-900/30 rounded-3xl blur-3xl"></div>
            
            <div className="relative bg-gradient-to-br from-slate-900/98 to-slate-950/98 backdrop-blur-3xl border-4 border-purple-500/60 rounded-3xl p-12 shadow-2xl max-h-[95vh] overflow-y-auto">

              {/* MAIN SUGGESTION */}
              <div className="text-center mb-16">
                <div className="inline-block bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-2 border-purple-400/50 rounded-3xl px-12 py-8 backdrop-blur-xl">
                  <p className="text-white text-3xl leading-relaxed font-bold max-w-3xl mx-auto">
                    {aiSuggestion.suggestion}
                  </p>
                </div>
              </div>

              {/* METRICS GRID - 2x2 LIKE SCREENSHOT */}
              {aiSuggestion.metrics && (
                <div className="grid grid-cols-2 gap-8 mb-16">
                  <div className="bg-gradient-to-br from-red-500/30 to-red-600/30 border-4 border-red-500/60 rounded-3xl p-12 text-center backdrop-blur-2xl shadow-2xl hover:scale-105 transition-all group">
                    <p className="text-red-300 text-lg font-bold uppercase tracking-wider mb-6">Expense Ratio</p>
                    <p className="text-red-100 text-6xl font-black drop-shadow-lg">{aiSuggestion.metrics.expenseRatio}</p>
                  </div>
                  <div className="bg-gradient-to-br from-emerald-500/30 to-emerald-600/30 border-4 border-emerald-500/60 rounded-3xl p-12 text-center backdrop-blur-2xl shadow-2xl hover:scale-105 transition-all group">
                    <p className="text-emerald-300 text-lg font-bold uppercase tracking-wider mb-6">Savings Rate</p>
                    <p className="text-emerald-100 text-6xl font-black drop-shadow-lg">{aiSuggestion.metrics.savingsPercentage}</p>
                  </div>
                </div>
              )}

              {/* RECOMMENDATION - BIG CYAN BUTTON LIKE SCREENSHOT */}
              {aiSuggestion.recommendation && (
                <div className="text-center mb-16">
                  <div className="inline-block bg-gradient-to-r from-cyan-500/50 to-blue-500/50 border-4 border-cyan-500/70 rounded-3xl p-16 backdrop-blur-2xl shadow-2xl hover:scale-105 transition-all group max-w-lg mx-auto cursor-pointer">
                    <p className="text-cyan-50 text-4xl font-bold leading-tight bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text text-transparent drop-shadow-2xl">
                      {aiSuggestion.recommendation}
                    </p>
                  </div>
                </div>
              )}

              {/* FOOTER */}
              <div className="pt-12 border-t-4 border-purple-500/40 text-center">
                <p className="text-purple-300 text-lg font-semibold">
                  Click ⬆ on mini advisor to expand
                </p>
                <p className="text-xs text-purple-400/80 mt-2 font-medium">
                  🔄 Updates after every transaction
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
