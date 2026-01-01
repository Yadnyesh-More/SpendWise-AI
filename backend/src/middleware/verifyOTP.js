import User from '../models/User.js';
import otpStore from '../utils/otpStore.js'; // Redis or in-memory

export const verifyOTP = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    
    const storedOTP = otpStore.get(email);
    if (!storedOTP || storedOTP !== otp) {
      return res.status(400).json({ success: false, message: 'Invalid OTP' });
    }
    
    // Clear OTP
    otpStore.delete(email);
    next();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
