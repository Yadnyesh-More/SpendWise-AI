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

  /* -------------------- EFFECTS -------------------- */

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

  /* -------------------- API -------------------- */

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
      console.error(err);
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
      } catch {
        const expenseRatio =
          s.income > 0 ? ((s.expense / s.income) * 100).toFixed(0) + '%' : '0%';
        const savingsRate =
          s.income > 0 ? (100 - parseInt(expenseRatio)) + '%' : '0%';

        setAiSuggestion({
          suggestion: 'Track expenses to improve savings.',
          metrics: {
            expenseRatio,
            savingsPercentage: savingsRate,
          },
          recommendation: 'Reduce unnecessary expenses',
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  /* -------------------- HANDLERS -------------------- */

  const handleTransactionAdded = () => {
    setRefreshKey((prev) => prev + 1);
    loadMonths();

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
  };

  const handleMinimize = () => {
    setShowAI(false);
    setIsMinimized(true);
  };

  if (loading && months.length === 0) {
    return <LoadingSpinner />;
  }

  /* -------------------- UI -------------------- */

  const expensePercentage =
    summary.income > 0
      ? ((summary.expense / summary.income) * 100).toFixed(1)
      : 0;

  return (
    <div className="min-h-screen bg-dark-primary">

      {/* -------------------- HEADER -------------------- */}
      <div className="sticky top-16 z-30 bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 border-b-2 border-white/20">
        <div className="max-w-7xl mx-auto px-6 py-8 flex justify-between items-center">
          <div>
            <h1 className="text-5xl font-black text-white">Dashboard</h1>
            <p className="text-white/80 text-sm mt-1">
              {selectedMonth === 'all'
                ? 'All Time Summary'
                : new Date(selectedMonth + '-01').toLocaleString('default', {
                    month: 'long',
                    year: 'numeric',
                  })}
            </p>
          </div>

          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-6 py-3 bg-white/20 border-2 border-white text-white rounded-xl font-bold"
          >
            <option value="all">All Time</option>
            {months.map((m) => (
              <option key={m} value={m}>
                {new Date(m + '-01').toLocaleString('default', {
                  month: 'long',
                  year: 'numeric',
                })}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* -------------------- CONTENT -------------------- */}
      <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <TransactionForm onTransactionAdded={handleTransactionAdded} />
        <div className="lg:col-span-2">
          <TransactionList
            transactions={transactions}
            onDelete={handleTransactionAdded}
          />
        </div>
      </div>

      {/* -------------------- MINI AI ADVISOR -------------------- */}
      {aiSuggestion && isMinimized && (
        <div
          onClick={handleViewInsight}
          className="fixed bottom-8 right-8 z-40 w-80 cursor-pointer"
        >
          <div className="relative bg-slate-900 border border-purple-500/40 rounded-2xl p-4 shadow-xl">
            {hasNewSuggestion && (
              <div className="absolute -inset-2 bg-purple-500/30 blur-xl rounded-3xl animate-pulse"></div>
            )}
            <p className="text-white text-sm line-clamp-2">
              {aiSuggestion.suggestion}
            </p>
            <p className="text-xs text-purple-400 text-center mt-2">
              Tap to view insights
            </p>
          </div>
        </div>
      )}

      {/* -------------------- AI PANEL (NO HEADER) -------------------- */}
      {showAI && aiSuggestion && !isMinimized && (
        <div className="fixed top-24 right-8 z-50 w-[420px] max-h-[70vh]">
          <div className="relative bg-slate-900 border-2 border-purple-500/50 rounded-3xl shadow-2xl flex flex-col">

            <div className="p-6 space-y-6 overflow-y-auto">
              <p className="text-white text-sm leading-relaxed">
                {aiSuggestion.suggestion}
              </p>

              {aiSuggestion.metrics && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-red-500/20 rounded-xl p-4 text-center">
                    <p className="text-red-300 text-xs uppercase">Expense</p>
                    <p className="text-red-100 text-2xl font-black">
                      {aiSuggestion.metrics.expenseRatio}
                    </p>
                  </div>
                  <div className="bg-emerald-500/20 rounded-xl p-4 text-center">
                    <p className="text-emerald-300 text-xs uppercase">Savings</p>
                    <p className="text-emerald-100 text-2xl font-black">
                      {aiSuggestion.metrics.savingsPercentage}
                    </p>
                  </div>
                </div>
              )}

              {aiSuggestion.recommendation && (
                <div className="bg-blue-500/20 rounded-xl p-4 text-center text-blue-200 font-semibold">
                  {aiSuggestion.recommendation}
                </div>
              )}
            </div>

            <div className="p-4 border-t border-white/10 flex justify-center">
              <button
                onClick={handleMinimize}
                className="px-6 py-2 bg-blue-500 hover:bg-blue-400 text-white rounded-xl font-semibold"
              >
                Minimize
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
