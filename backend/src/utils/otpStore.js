// Simple in-memory (use Redis in production)
const otpStore = new Map();

export default {
  set: (email, otp, expiresIn = 300000) => { // 5 min
    otpStore.set(email, otp);
    setTimeout(() => otpStore.delete(email), expiresIn);
  },
  get: (email) => otpStore.get(email),
  delete: (email) => otpStore.delete(email)
};
