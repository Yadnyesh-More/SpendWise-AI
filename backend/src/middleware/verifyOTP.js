import User from '../models/User.js';
import otpStore from '../utils/otpStore.js';

export const verifyOTP = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    
    const storedOTP = otpStore.get(email);
    if (!storedOTP || storedOTP !== otp) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid or expired OTP' 
      });
    }
    
    // Clear OTP after verify
    otpStore.delete(email);
    next();
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};
