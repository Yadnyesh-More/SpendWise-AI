// import express from 'express';
// import jwt from 'jsonwebtoken';
// import User from '../models/User.js';

// const router = express.Router();

// // Register
// router.post('/register', async (req, res) => {
//   try {
//     const { name, email, password } = req.body;

//     // Validation
//     if (!name || !email || !password) {
//       return res.status(400).json({
//         success: false,
//         message: 'Please provide all required fields',
//       });
//     }

//     // Check if user exists
//     const existingUser = await User.findOne({ email: email.toLowerCase() });
//     if (existingUser) {
//       return res.status(400).json({
//         success: false,
//         message: 'Email already registered',
//       });
//     }

//     // Create user
//     const user = new User({
//       name,
//       email: email.toLowerCase(),
//       password,
//     });

//     await user.save();

//     // Generate token
//     const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
//       expiresIn: '7d',
//     });

//     return res.status(201).json({
//       success: true,
//       message: 'User registered successfully',
//       token,
//       user: {
//         _id: user._id,
//         name: user.name,
//         email: user.email,
//         role: user.role,
//       },
//     });
//   } catch (err) {
//     console.error('Register error:', err.message);
//     return res.status(500).json({
//       success: false,
//       message: err.message || 'Error registering user',
//     });
//   }
// });

// // Login
// router.post('/login', async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     // Validation
//     if (!email || !password) {
//       return res.status(400).json({
//         success: false,
//         message: 'Please provide email and password',
//       });
//     }

//     // Find user and get password
//     const user = await User.findOne({ email: email.toLowerCase() }).select(
//       '+password'
//     );

//     if (!user) {
//       return res.status(401).json({
//         success: false,
//         message: 'Invalid credentials',
//       });
//     }

//     // Check password
//     const isMatch = await user.matchPassword(password);
//     if (!isMatch) {
//       return res.status(401).json({
//         success: false,
//         message: 'Invalid credentials',
//       });
//     }

//     // Generate token
//     const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
//       expiresIn: '7d',
//     });

//     return res.json({
//       success: true,
//       message: 'Login successful',
//       token,
//       user: {
//         _id: user._id,
//         name: user.name,
//         email: user.email,
//         role: user.role,
//       },
//     });
//   } catch (err) {
//     console.error('Login error:', err.message);
//     return res.status(500).json({
//       success: false,
//       message: err.message || 'Error logging in',
//     });
//   }
// });

// // Get current user
// router.get('/me', async (req, res) => {
//   try {
//     const user = await User.findById(req.user._id);

//     return res.json({
//       success: true,
//       user,
//     });
//   } catch (err) {
//     console.error('Get user error:', err.message);
//     return res.status(500).json({
//       success: false,
//       message: 'Error fetching user',
//     });
//   }
// });

// // Logout (client-side only - just for completeness)
// router.post('/logout', (req, res) => {
//   return res.json({
//     success: true,
//     message: 'Logout successful',
//   });
// });

// export default router;


import express from 'express';

const router = express.Router();

router.post('/budget-suggestion', async (req, res) => {
  try {
    const { income, expense, month } = req.body;

    if (income === undefined || expense === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Income and expense are required'
      });
    }

    // Smart calculation
    const expenseRatio = income > 0 ? Math.round((expense / income) * 100) : 0;
    const savingsRate = 100 - expenseRatio;

    let suggestion, recommendation;

    if (expenseRatio === 0) {
      suggestion = "No transactions yet! Add your first income/expense to get personalized advice.";
      recommendation = "Start tracking your finances";
    } else if (expenseRatio < 50) {
      suggestion = "🎉 Excellent! You're spending way below average. You're building serious wealth!";
      recommendation = "Invest 30% in index funds 🚀";
    } else if (expenseRatio < 70) {
      suggestion = "💪 Great financial discipline! You're saving more than most people.";
      recommendation = "Invest 20% in mutual funds 📈";
    } else if (expenseRatio < 90) {
      suggestion = "👌 Good job! Room to optimize spending habits for better savings.";
      recommendation = "Build 3-month emergency fund 🛡️";
    } else {
      suggestion = "⚠️ High spending detected. Review discretionary expenses to boost savings.";
      recommendation = "Cut dining out & subscriptions first ✂️";
    }

    res.json({
      success: true,
      ai: {
        suggestion,
        metrics: {
          expenseRatio: `${expenseRatio}%`,
          savingsPercentage: `${savingsRate}%`
        },
        recommendation
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'AI suggestion error: ' + error.message
    });
  }
});

export default router;

