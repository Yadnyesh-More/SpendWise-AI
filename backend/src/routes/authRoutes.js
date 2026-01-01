import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { loginLimiter } from '../middleware/rateLimiter.js';
import otpStore from '../utils/otpStore.js';  // NEW
import { sendEmail } from '../utils/email.js'; // NEW
import { verifyOTP } from '../middleware/verifyOTP.js'; // NEW

console.log('✅ authRoutes loaded');

const router = express.Router();

// Helper function to generate JWT token
function generateToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: '7d'
  });
}

// NEW: Send OTP to email (Step 1)
router.post('/send-otp', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    // Check if email exists (allow login OTP too)
    const existingUser = await User.findOne({ email });
    
    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store OTP (expires in 5 min)
    otpStore.set(email, otp);
    
    // Send email
    await sendEmail(email, otp);
    
    res.json({
      success: true,
      message: existingUser 
        ? 'OTP sent to your registered email' 
        : 'OTP sent! Check your inbox (including spam)'
    });
  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send OTP'
    });
  }
});

// NEW: Verify OTP + Register/Login (Step 2)
router.post('/verify-otp', verifyOTP, async (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body;

    // Login if user exists, register if new
    let user = await User.findOne({ email });

    if (user) {
      // LOGIN flow
      const isPasswordCorrect = await user.matchPassword(password);
      if (!isPasswordCorrect) {
        return res.status(400).json({
          success: false,
          message: 'Invalid password'
        });
      }

      const token = generateToken(user._id);
      return res.json({
        success: true,
        message: 'Login successful',
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        },
        isNewUser: false
      });
    }

    // REGISTER flow (new user)
    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters'
      });
    }

    // Create new user
    user = await User.create({
      name,
      email,
      password
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      isNewUser: true
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Verification error: ' + error.message
    });
  }
});

// OLD: Keep for backward compatibility (optional)
router.post('/login', loginLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const isPasswordCorrect = await user.matchPassword(password);
    if (!isPasswordCorrect) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Login error: ' + error.message
    });
  }
});

// Google OAuth (unchanged)
router.post('/google', async (req, res) => {
  try {
    const { googleId, email, name } = req.body;

    let user = await User.findOne({
      $or: [{ googleId }, { email }]
    });

    if (!user) {
      user = await User.create({
        googleId,
        email,
        name
      });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Google login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Google login error: ' + error.message
    });
  }
});

export default router;
