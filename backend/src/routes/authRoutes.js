import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { loginLimiter } from '../middleware/rateLimiter.js';
console.log('✅ authRoutes loaded');


const router = express.Router();


// generate JWT token
function generateToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: '7d'
  });
}


// Register - Create new user
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body;


    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
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
        message: 'Password must be at least 6 characters'
      });
    }


    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered'
      });
    }


    // Create new user
    const user = await User.create({
      name,
      email,
      password
    });


    // Generate token
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
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Registration error: ' + error.message
    });
  }
});


// Login - Authenticate user
router.post('/login', loginLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;


    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }


    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email or password'
      });
    }


    // Check password
    const isPasswordCorrect = await user.matchPassword(password);
    if (!isPasswordCorrect) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email or password'
      });
    }


    // Generate token
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


// Google OAuth login (simplified)
router.post('/google', async (req, res) => {
  try {
    const { googleId, email, name } = req.body;


    // Find or create user
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