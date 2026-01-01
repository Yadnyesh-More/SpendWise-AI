// Fast in-memory store (Redis production)
const otpStore = new Map();

export default {
  set: (email, otp, expiresIn = 300000) => { // 5 min
    otpStore.set(email, otp);
    // Clear expired immediately
    setTimeout(() => otpStore.delete(email), expiresIn);
  },
  get: (email) => {
    const otp = otpStore.get(email);
    if (!otp) return null;
    // Manual expiry check
    if (Date.now() > (otp.timestamp + 300000)) {
      otpStore.delete(email);
      return null;
    }
    return otp.otp;
  },
  delete: (email) => otpStore.delete(email)
};
