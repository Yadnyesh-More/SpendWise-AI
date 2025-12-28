import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';

function Register({ setUser }) {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
    setError('Passwords do not match');
    return;
  }
    setLoading(true);

    try {
      const res = await api.post('/auth/register', {
      name: form.name,
      email: form.email,
      password: form.password,
    });
      const { token, user } = res.data;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      setUser(user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[#0F1419]">
      <div className="w-full max-w-md">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-[#191F2B] border border-[#2E3748] mb-4">
            <span className="text-3xl">💰</span>
          </div>
          <h1 className="text-3xl font-bold text-[#E6EAF2]">SpendWise-AI</h1>
          <p className="text-[#8B93A7] mt-2">Smart Budget Management</p>
        </div>

        {/* Card */}
        <div className="bg-[#191F2B] border border-[#2E3748] rounded-2xl p-8 shadow-lg">
          <h2 className="text-2xl font-semibold text-[#E6EAF2] mb-1">
            Create Account
          </h2>
          <p className="text-[#8B93A7] mb-6">
            Register to start managing your budget
          </p>

          {error && (
            <div className="mb-4 px-4 py-3 rounded-lg border border-[#E06C75]/30 bg-[#E06C75]/10 text-[#E06C75] text-sm">
              ❌ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-[#8B93A7] mb-2">Name</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                placeholder="Your Name"
                className="w-full bg-[#0F1419] border border-[#2E3748] rounded-lg px-4 py-3 text-[#E6EAF2] placeholder-[#8B93A7] focus:outline-none focus:ring-1 focus:ring-[#5B8CFF]/40"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#8B93A7] mb-2">Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                placeholder="you@example.com"
                className="w-full bg-[#0F1419] border border-[#2E3748] rounded-lg px-4 py-3 text-[#E6EAF2] placeholder-[#8B93A7] focus:outline-none focus:ring-1 focus:ring-[#5B8CFF]/40"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#8B93A7] mb-2">Password</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                required
                placeholder="••••••••"
                className="w-full bg-[#0F1419] border border-[#2E3748] rounded-lg px-4 py-3 text-[#E6EAF2] placeholder-[#8B93A7] focus:outline-none focus:ring-1 focus:ring-[#5B8CFF]/40"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#8B93A7] mb-2">Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                required
                placeholder="••••••••"
                className="w-full bg-[#0F1419] border border-[#2E3748] rounded-lg px-4 py-3 text-[#E6EAF2] placeholder-[#8B93A7] focus:outline-none focus:ring-1 focus:ring-[#5B8CFF]/40"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-lg font-semibold transition ${
                loading
                  ? 'bg-[#2E3748] text-[#8B93A7] cursor-not-allowed'
                  : 'bg-[#5B8CFF] hover:bg-[#6FA8FF] text-[#0F1419]'
              }`}
            >
              {loading ? 'Registering...' : 'Register'}
            </button>
          </form>

          <p className="mt-6 text-center text-[#8B93A7]">
            Already have an account?{' '}
            <Link
              to="/login"
              className="text-[#5B8CFF] hover:underline font-medium"
            >
              Login here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;
