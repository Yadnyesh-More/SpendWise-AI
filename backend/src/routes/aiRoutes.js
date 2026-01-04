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

