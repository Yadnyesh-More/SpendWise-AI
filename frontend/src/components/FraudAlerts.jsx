import React, { useState, useEffect } from 'react';
import api from '../api';

const FraudAlerts = ({ userId }) => {
  const [alerts, setAlerts] = useState([]);
  const [avgSpend, setAvgSpend] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const res = await api.get('/analytics/fraud-alerts', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setAlerts(res.data.alerts);
      setAvgSpend(res.data.avgSpend);
    } catch (error) {
      console.error('Fraud alerts error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`p-6 rounded-3xl border-4 transition-all ${
      alerts.length 
        ? 'border-red-400/50 bg-red-500/10' 
        : 'border-green-400/30 bg-green-500/5'
    }`}>
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
          alerts.length ? 'bg-red-500/20' : 'bg-green-500/20'
        }`}>
          {alerts.length ? '⚠️' : '✅'}
        </div>
        <div>
          <h3 className="text-2xl font-black text-white">Fraud Detection</h3>
          <p className="text-white/70">Average spend: ₹{avgSpend.toLocaleString()}</p>
        </div>
      </div>
      
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        </div>
      ) : alerts.length ? (
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {alerts.map(alert => (
            <div key={alert._id} className="bg-red-500/20 border border-red-400/50 p-4 rounded-2xl">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-bold text-red-100">⚠️ Unusual: ₹{alert.amount.toLocaleString()}</p>
                  <p className="text-red-200 text-sm">{alert.description}</p>
                  <p className="text-red-300 text-xs mt-1">{new Date(alert.date).toLocaleDateString()}</p>
                </div>
                <span className="text-2xl">🚨</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-green-100 text-lg">✅ No suspicious activity detected!</p>
      )}
    </div>
  );
};

export default FraudAlerts;
