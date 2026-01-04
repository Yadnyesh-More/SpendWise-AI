import React, { useEffect, useState } from 'react';

function AIAdvisor({ suggestion, onDismiss }) {
  const [animate, setAnimate] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  useEffect(() => {
    setAnimate(true);
    setIsMinimized(false);
  }, [suggestion]);

  if (!suggestion) return null;

  return (
    <>
      {/* Blur Overlay */}
      {!isMinimized && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          onClick={onDismiss}
        />
      )}

      {/* AI Advisor Card*/}
      <div className={`fixed z-50 transition-all duration-500 ${
        isMinimized 
          ? 'bottom-6 right-6 w-80' 
          : 'bottom-6 right-6 w-96 max-w-[calc(100vw-3rem)]'
      }`}>
        <div className={`
          bg-gradient-to-br from-slate-800 via-gray-900 to-slate-900
          text-white rounded-3xl shadow-2xl p-6 backdrop-blur-2xl 
          border-2 border-indigo-500/40 
          transform transition-all duration-700 ease-out
          ${animate ? 'scale-100 opacity-100 translate-y-0' : 'scale-95 opacity-0 translate-y-4'}
          hover:shadow-[0_35px_60px_-15px_rgba(99,102,241,0.3)]
          hover:border-indigo-400/60
        `}>
          {/* Header */}
          <div className="flex items-start justify-between mb-5 pb-4 border-b border-white/10">
            <div className="flex items-center gap-3 flex-1">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg animate-pulse">
                <span className="text-2xl">🤖</span>
              </div>
              <div>
                <h3 className="font-black text-xl bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent drop-shadow-lg">
                  Budget Coach
                </h3>
                <p className="text-gray-300 text-xs font-semibold tracking-wide">Spend-Ai Insights</p>
              </div>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="text-gray-300 hover:text-white text-xl p-2 rounded-xl transition-all hover:bg-white/10 hover:scale-110"
                title={isMinimized ? 'Expand' : 'Minimize'}
              >
                {isMinimized ? '⬆️' : '⬇️'}
              </button>
              <button
                onClick={onDismiss}
                className="text-gray-400 hover:text-white text-xl p-2 rounded-xl transition-all hover:bg-red-500/20 hover:scale-110"
              >
                ✕
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              <div className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 
                              border border-indigo-400/30 rounded-2xl p-6 mb-6 
                              backdrop-blur-xl shadow-inner">
                <div className="flex items-start gap-3 mb-3">
                  <span className="text-2xl shrink-0 mt-0.5">🎯</span>
                  <p className="text-base leading-relaxed font-semibold text-white/95 
                               max-h-20 overflow-y-auto">
                    {suggestion.suggestion}
                  </p>
                </div>
              </div>

              {/* Metrics Grid*/}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="group bg-gradient-to-br from-red-500/15 to-pink-500/15 
                               border-2 border-red-400/40 rounded-2xl p-5 backdrop-blur-xl 
                               hover:from-red-500/25 hover:border-red-400/60 transition-all">
                  <p className="text-4xl font-black bg-gradient-to-r from-red-400 to-red-200 
                               bg-clip-text text-transparent drop-shadow-lg mb-2 
                               group-hover:scale-110 transition-transform">
                    {suggestion.metrics.expenseRatio}
                  </p>
                  <p className="text-sm font-bold text-gray-200 tracking-wide uppercase">
                    Expense Ratio
                  </p>
                </div>
                <div className="group bg-gradient-to-br from-emerald-500/15 to-teal-500/15 
                               border-2 border-emerald-400/40 rounded-2xl p-5 backdrop-blur-xl 
                               hover:from-emerald-500/25 hover:border-emerald-400/60 transition-all">
                  <p className="text-4xl font-black bg-gradient-to-r from-emerald-400 to-emerald-200 
                               bg-clip-text text-transparent drop-shadow-lg mb-2 
                               group-hover:scale-110 transition-transform">
                    {suggestion.metrics.savingsPercentage}
                  </p>
                  <p className="text-sm font-bold text-gray-200 tracking-wide uppercase">
                    Savings Rate
                  </p>
                </div>
              </div>

              {/* Action Button*/}
              <button className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 
                                hover:from-indigo-600 hover:to-purple-700 
                                border-2 border-indigo-400/50 text-white font-black 
                                py-4 px-6 rounded-2xl transition-all hover:scale-105 
                                hover:shadow-[0_15px_35px_rgba(99,102,241,0.4)]
                                shadow-lg backdrop-blur-sm text-lg">
                💡 {suggestion.recommendation}
              </button>

              {/* Footer */}
              <p className="text-xs text-gray-400 text-center mt-4 font-medium tracking-wide">
                ✨ Real-time AI Analysis • Updates after every transaction
              </p>
            </>
          )}
        </div>
      </div>
    </>
  );
}

export default AIAdvisor;
