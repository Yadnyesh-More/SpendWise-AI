import React, { useEffect, useState } from 'react';

function Profile({ user, onLogout }) {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setUserData(user);
    setLoading(false);
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-primary flex items-center justify-center">
        <div className="animate-spin">
          <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-primary">
      {/* Header with Gradient Background */}
      <div className="sticky top-16 z-30 bg-gradient-to-r from-violet-600 via-purple-500 to-violet-600 backdrop-blur-xl border-b-2 border-white/20 shadow-xl">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <h1 className="text-5xl font-black text-white drop-shadow-lg">👤 Profile</h1>
          <p className="text-white/80 text-sm font-semibold mt-1 drop-shadow-md">Manage your account</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Profile Card */}
        <div className="bg-dark-surface border-2 border-violet-400/50 rounded-3xl p-8 shadow-lg mb-8 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-60 h-60 bg-gradient-to-br from-violet-600 to-purple-600 opacity-10 rounded-full blur-3xl"></div>
          
          <div className="relative z-10">
            {/* Avatar */}
            <div className="flex flex-col items-center mb-8 pb-8 border-b border-dark-border">
              <div className="w-24 h-24 bg-gradient-to-br from-violet-500 to-purple-500 rounded-full flex items-center justify-center text-5xl shadow-lg border-4 border-white/20">
                👤
              </div>
              <h2 className="text-3xl font-black text-violet-300 mt-4 capitalize drop-shadow-lg">{userData?.name || 'User'}</h2>
              <p className="text-text-muted text-sm mt-1">{userData?.email}</p>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {[
                { label: 'Email', value: userData?.email, icon: '📧', gradient: 'from-blue-500/20 to-cyan-500/20', borderColor: 'border-blue-400/50', textColor: 'text-blue-300' },
                { label: 'Account Type', value: userData?.role || 'User', icon: '👑', gradient: 'from-yellow-500/20 to-orange-500/20', borderColor: 'border-yellow-400/50', textColor: 'text-yellow-300' },
                { label: 'Member Since', value: userData?.createdAt ? new Date(userData.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Recently', icon: '📅', gradient: 'from-green-500/20 to-teal-500/20', borderColor: 'border-green-400/50', textColor: 'text-green-300' },
                { label: 'Status', value: 'Active', icon: '🟢', gradient: 'from-emerald-500/20 to-teal-500/20', borderColor: 'border-emerald-400/50', textColor: 'text-emerald-300' }
              ].map((item, idx) => (
                <div key={idx} className={`bg-gradient-to-br ${item.gradient} border-2 ${item.borderColor} rounded-2xl p-6 backdrop-blur-sm`}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">{item.icon}</span>
                    <p className="text-text-muted text-xs font-bold uppercase">{item.label}</p>
                  </div>
                  <p className={`text-lg font-black ${item.textColor}`}>{item.value}</p>
                </div>
              ))}
            </div>

            {/* Settings */}
            <h3 className="text-2xl font-black text-violet-300 mb-6 drop-shadow-lg">⚙️ Settings</h3>

            <div className="space-y-4">
              {[
                { icon: '📧', title: 'Email Notifications', desc: 'Get updates', gradient: 'from-blue-500/20 to-cyan-500/20', borderColor: 'border-blue-400/50' },
                { icon: '🔒', title: 'Privacy Mode', desc: 'Hide transactions', gradient: 'from-orange-500/20 to-red-500/20', borderColor: 'border-orange-400/50' },
                { icon: '🔐', title: 'Two-Factor Auth', desc: 'Extra security', gradient: 'from-purple-500/20 to-pink-500/20', borderColor: 'border-purple-400/50' }
              ].map((setting, idx) => (
                <div key={idx} className={`bg-gradient-to-r ${setting.gradient} border-2 ${setting.borderColor} rounded-2xl p-6 flex items-center justify-between hover:shadow-lg transition-all`}>
                  <div>
                    <p className="text-text-primary font-bold">{setting.icon} {setting.title}</p>
                    <p className="text-text-muted text-sm">{setting.desc}</p>
                  </div>
                  <input type="checkbox" className="w-6 h-6 cursor-pointer" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Logout */}
        <div className="bg-gradient-to-br from-red-600/20 to-orange-600/20 border-2 border-red-400/50 rounded-3xl p-8 backdrop-blur-sm overflow-hidden relative">
          <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-red-600 to-orange-600 opacity-10 rounded-full blur-3xl"></div>
          
          <div className="relative z-10">
            <h3 className="text-2xl font-black text-red-400 mb-4 drop-shadow-lg">⚠️ Danger Zone</h3>
            <button
              onClick={onLogout}
              className="w-full bg-gradient-to-r from-red-500 to-orange-600 text-white font-black py-4 rounded-xl hover:scale-105 transition-all shadow-lg hover:shadow-xl"
            >
              🚪 Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
// Profie --- IGNORE ---