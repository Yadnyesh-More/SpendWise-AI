import Transaction from '../models/Transaction.js';
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

export const detectFraud = async (req, res, next) => {
  try {
    const { userId } = req.user;
    const { amount, merchant, description } = req.body;

    // Get 30-day average
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const stats = await Transaction.aggregate([
      { 
        $match: { userId, date: { $gte: thirtyDaysAgo } } 
      },
      { 
        $group: { 
          _id: null, 
          avg: { $avg: '$amount' },
          max: { $max: '$amount' }
        } 
      }
    ]);

    const avg = stats[0]?.avg || 500;
    const isFraud = amount > avg * 3;

    if (isFraud) {
      req.body.isFlagged = true;
      req.fraudAlert = {
        message: `⚠️ Unusual: ₹${amount} (Avg: ₹${Math.round(avg)})`,
        severity: 'high'
      };

      // Send email async
      transporter.sendMail({
        to: req.user.email,
        subject: '🚨 Fraud Alert - Budget Coach',
        html: `<h2>⚠️ Unusual transaction detected</h2><p>Amount: ₹${amount}</p><p>${merchant || description}</p>`
      }).catch(console.error);
    }

    next();
  } catch (error) {
    console.error('Fraud detection error:', error);
    next();
  }
};

export default detectFraud;
