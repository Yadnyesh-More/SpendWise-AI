import express from 'express';
import PDFDocument from 'pdfkit';
import Transaction from '../models/Transaction.js';

const router = express.Router();

// PDF EXPORT - PUBLIC (no auth needed)
router.get('/pdf/:month?', async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) {
      return res.status(400).json({ success: false, message: 'userId required' });
    }
    
    const { month } = req.params;
    let match = { userId };
    if (month) {
      const [year, mon] = month.split('-').map(Number);
      match.date = {
        $gte: new Date(year, mon - 1, 1),
        $lt: new Date(year, mon, 0)
      };
    }
    
    const transactions = await Transaction.find(match).sort({ date: -1 }).limit(100);
    console.log(`Found ${transactions.length} transactions for userId=${userId}`);
    
    const doc = new PDFDocument({ margin: 50 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=budget-${month || 'all'}.pdf`);
    doc.pipe(res);

    // Header
    doc.fontSize(24).fillColor('#1E40AF').text('Budget Coach Report', 50, 57);
    doc.fontSize(12).fillColor('#333333').text(`Generated: ${new Date().toLocaleDateString()}`, 50, 85);

    // Summary section
    let yPosition = 150;
    doc.rect(50, yPosition - 10, 500, 40).fill('#1E40AF').opacity(0.1);
    doc.fontSize(16).fillColor('#1E40AF').text('Summary', 60, yPosition);
    yPosition += 60;

    const totalExpense = transactions.reduce((sum, t) => t.type === 1 ? sum + t.amount : sum, 0);
    const totalIncome = transactions.reduce((sum, t) => t.type === -1 ? sum + t.amount : sum, 0);
    const netSavings = totalIncome - totalExpense;

    // Use BLACK text for visibility
    doc.fontSize(12).fillColor('#000000');
    doc.text(`Total Expenses: ₹${totalExpense.toLocaleString()}`, 60, yPosition);
    doc.text(`Total Income: ₹${totalIncome.toLocaleString()}`, 60, yPosition + 20);
    doc.text(`Net Savings: ₹${netSavings.toLocaleString()}`, 60, yPosition + 40);
    yPosition += 100;

    // Transactions
    doc.rect(50, yPosition - 10, 500, 30).fill('#10B981').opacity(0.1);
    doc.fontSize(14).fillColor('#10B981').text('Recent Transactions', 60, yPosition);
    yPosition += 50;

    if (transactions.length === 0) {
      doc.fontSize(11).fillColor('#999999').text('No transactions found for this period', 60, yPosition);
    } else {
      transactions.slice(0, 20).forEach((tx) => {
        const typeLabel = tx.type === 1 ? '💸 Expense' : '💰 Income';
        doc.fontSize(11).fillColor(tx.isFlagged ? '#EF4444' : '#000000');
        doc.text(
          `${typeLabel} | ${new Date(tx.date).toLocaleDateString()} | ₹${tx.amount.toLocaleString()} | ${tx.description || 'N/A'}`,
          60,
          yPosition
        );
        yPosition += 25;
        if (yPosition > 700) return;
      });
    }

    doc.end();
  } catch (error) {
    console.error('PDF Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});


// CSV EXPORT - Also public
router.get('/csv/:month?', async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) {
      return res.status(400).json({ success: false, message: 'userId query param required' });
    }

    let match = { userId };
    const { month } = req.params;
    if (month) {
      const [year, mon] = month.split('-').map(Number);
      match.date = {
        $gte: new Date(year, mon - 1, 1),
        $lt: new Date(year, mon, 0)
      };
    }

    const transactions = await Transaction.find(match);

    const csvData = transactions.map(tx => ({
      Date: new Date(tx.date).toLocaleDateString(),
      Amount: tx.amount,
      Type: tx.type === 1 ? 'Expense' : 'Income',
      Category: tx.category,
      Description: tx.description,
      Merchant: tx.merchant || ''
    }));

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=budget-${month || 'all'}.csv`);
    
    const csv = [
      'Date,Amount,Type,Category,Description,Merchant',
      ...csvData.map(row => 
        Object.values(row).map(val => `"${val}"`).join(',')
      )
    ].join('\n');
    
    res.send(csv);
  } catch (error) {
    console.error('CSV Export error:', error);
    res.status(500).json({ success: false, message: 'CSV generation failed' });
  }
});

export default router;
