import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';

function Register({ setUser }) {
  const [step, setStep] = useState(1); // 1=Email, 2=OTP+Form
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value
    }));
    setError(''); // Clear error on input
  }

  const sendOTP = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.email) {
      setError('Please enter email');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/send-otp', { email: form.email });
      setStep(2); // Move to OTP+Form step
      setError(''); // Clear any previous errors
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const verifyAndRegister = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!form.name || !form.email || !otp || !form.password || !form.confirmPassword) {
      setError('Please fill all fields');
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (form.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (otp.length !== 6) {
      setError('Enter valid 6-digit OTP');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/auth/verify-otp', {
        name: form.name,
        email: form.email,
        password: form.password,
        confirmPassword: form.confirmPassword,
        otp
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
  };

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
            {step === 1 ? 'Verify Email' : 'Complete Registration'}
          </h2>
          <p className="text-[#8B93A7] mb-6">
            {step === 1 
              ? 'Enter email to receive OTP' 
              : 'Enter OTP and complete your details'
            }
          </p>

          {error && (
            <div className="mb-4 px-4 py-3 rounded-lg border border-[#E06C75]/30 bg-[#E06C75]/10 text-[#E06C75] text-sm">
              ❌ {error}
            </div>
          )}

          {step === 1 ? (
            // STEP 1: Email + Send OTP
            <form onSubmit={sendOTP} className="space-y-5">
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
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2 ${
                  loading
                    ? 'bg-[#2E3748] text-[#8B93A7] cursor-not-allowed'
                    : 'bg-[#5B8CFF] hover:bg-[#6FA8FF] text-[#0F1419]'
                }`}
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-[#8B93A7] border-t-[#5B8CFF] rounded-full animate-spin"></div>
                    Sending OTP...
                  </>
                ) : (
                  'Send OTP'
                )}
              </button>
            </form>
          ) : (
            // STEP 2: OTP + Form
            <form onSubmit={verifyAndRegister} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-[#8B93A7] mb-2">Enter OTP</label>
                <input
                  type="text"
                  maxLength="6"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="123456"
                  className="w-full bg-[#0F1419] border border-[#2E3748] rounded-lg px-4 py-3 text-[#E6EAF2] placeholder-[#8B93A7] focus:outline-none focus:ring-1 focus:ring-[#5B8CFF]/40"
                />
              </div>

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
                className={`w-full py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2 ${
                  loading
                    ? 'bg-[#2E3748] text-[#8B93A7] cursor-not-allowed'
                    : 'bg-[#5B8CFF] hover:bg-[#6FA8FF] text-[#0F1419]'
                }`}
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-[#8B93A7] border-t-[#5B8CFF] rounded-full animate-spin"></div>
                    Verifying...
                  </>
                ) : (
                  'Complete Registration'
                )}
              </button>
            </form>
          )}

          <p className="mt-6 text-center text-[#8B93A7]">
            Already have an account?{' '}
            <Link
              to="/login"
              className="text-[#5B8CFF] hover:underline font-medium"
            >
              Login here
            </Link>
          </p>

          {step === 2 && (
            <button
              type="button"
              onClick={() => setStep(1)}
              className="w-full mt-3 text-[#8B93A7] hover:text-[#5B8CFF] text-sm underline"
            >
              Change Email
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default Register;
