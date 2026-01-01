import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { loginLimiter } from '../middleware/rateLimiter.js';
import otpStore from '../utils/otpStore.js';
import { sendEmail } from '../utils/email.js';
import { verifyOTP } from '../middleware/verifyOTP.js';

console.log('✅ authRoutes loaded');

const router = express.Router();

// Generate JWT
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: '7d'
  });
};

// 🚀 FAST OTP SEND (3-5s) - Full form data
router.post('/send-otp', async (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body;

    // Fast validation (no DB check = instant)
    if (!email || !name || !password || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'All fields required'
      });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match'
      });
    }
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be 6+ characters'
      });
    }

    // Generate OTP instantly
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store + send PARALLEL (fast!)
    otpStore.set(email, otp);
    await sendEmail(email, otp);
    
    console.log(`🚀 OTP ${otp} → ${email}`); // Render logs

    res.json({
      success: true,
      message: 'OTP sent! Check inbox/spam (5min expiry)'
    });
  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'OTP send failed'
    });
  }
});

// 🚀 VERIFY + CREATE/LOGIN (2s)
router.post('/verify-otp', verifyOTP, async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check existing user FAST
    let user = await User.findOne({ email });

    if (user) {
      // LOGIN (OAuth/password)
      if (user.password) {
        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
          return res.status(400).json({
            success: false,
            message: 'Invalid password'
          });
        }
      }
      const token = generateToken(user._id);
      return res.json({
        success: true,
        message: 'Login successful',
        token,
        user: { id: user._id, name: user.name, email, role: user.role },
        isNewUser: false
      });
    }

    // NEW REGISTER
    user = new User({ name, email, password });
    await user.save();

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Account created!',
      token,
      user: { id: user._id, name: user.name, email, role: user.role },
      isNewUser: true
    });
  } catch (error) {
    console.error('Verify error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Keep old routes unchanged
router.post('/login', loginLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password required'
      });
    }

    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(400).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const token = generateToken(user._id);
    res.json({
      success: true,
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

router.post('/google', async (req, res) => {
  try {
    const { googleId, email, name } = req.body;
    let user = await User.findOne({ $or: [{ googleId }, { email }] });

    if (!user) {
      user = await User.create({ googleId, email, name });
    }

    const token = generateToken(user._id);
    res.json({
      success: true,
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

export default router;
