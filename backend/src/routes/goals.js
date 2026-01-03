import express from 'express';
import Goal from '../models/Goal.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// GET all goals for user
router.get('/goals', auth, async (req, res) => {
  try {
    const goals = await Goal.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.json(goals);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST create goal (existing)
router.post('/goals', auth, async (req, res) => {
  try {

    console.log('Goal POST - req.user:', req.user);  // TEMP DEBUG
    console.log('Goal POST - req.body:', req.body); 
    
    const goal = new Goal({
      userId: req.userId,
      ...req.body
    });
    await goal.save();
    res.status(201).json(goal);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
