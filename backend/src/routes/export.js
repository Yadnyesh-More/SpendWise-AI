import express from 'express';
import PDFDocument from 'pdfkit';
import Transaction from '../models/Transaction.js';

const router = express.Router();

// PDF EXPORT - PUBLIC (no auth needed)
router.get('/pdf/:month?', async (req, res) => {
  try {
    const { userId } = req.query;  // From frontend: ?userId=xxx
    if (!userId) {
      return res.status(400).json({ 
        success: false, 
        message: 'userId query param required (e.g. ?userId=yourUserObjectId)' 
      });
    }
    
    const { month } = req.params;
    
    // Filter by month if provided (YYYY-MM)
    let match = { userId };
    if (month) {
      const [year, mon] = month.split('-').map(Number);
      match.date = {
        $gte: new Date(year, mon - 1, 1),
        $lt: new Date(year, mon, 0)
      };
    }
    
    const transactions = await Transaction.find(match).sort({ date: -1 }).limit(100);
    
    const doc = new PDFDocument({ margin: 50 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=budget-report-${month || 'all'}.pdf`);
    doc.pipe(res);

    // Header
    doc.fontSize(24).fillColor('#1E40AF').text('Budget Coach Report', 50, 57);
    doc.fontSize(12).fillColor('#6B7280').text(`Generated: ${new Date().toLocaleDateString()}`, 50, 85);

    // Summary
    let yPosition = 150;
    doc.rect(50, yPosition - 10, 500, 40).fill('#1E40AF').opacity(0.1);
    doc.fontSize(16).fillColor('#1E40AF').text('Summary', 60, yPosition);
    yPosition += 60;

    const totalExpense = transactions.reduce((sum, t) => t.type === 1 ? sum + t.amount : sum, 0);
    const totalIncome = transactions.reduce((sum, t) => t.type === -1 ? sum + t.amount : sum, 0);

    doc.fontSize(12).text(`Total Expenses: ₹${totalExpense.toLocaleString()}`, 60, yPosition);
    doc.text(`Total Income: ₹${totalIncome.toLocaleString()}`, 60, yPosition + 20);
    doc.text(`Net Savings: ₹${(totalIncome - totalExpense).toLocaleString()}`, 60, yPosition + 40);
    yPosition += 100;

    // Transactions
    doc.rect(50, yPosition - 10, 500, 30).fill('#10B981').opacity(0.1);
    doc.fontSize(14).fillColor('#10B981').text('Recent Transactions', 60, yPosition);
    yPosition += 50;

    transactions.slice(0, 20).forEach((tx) => {
      const typeIcon = tx.type === 1 ? '💸 Expense' : '💰 Income';
      doc.fontSize(11)
        .fillColor(tx.isFlagged ? '#EF4444' : '#6B7280')
        .text(`${typeIcon} | ${new Date(tx.date).toLocaleDateString()} | ₹${tx.amount.toLocaleString()} | ${tx.description || 'N/A'}`, 60, yPosition);
      
      if (tx.isFlagged) {
        doc.fillColor('#EF4444').text('⚠️ Fraud Alert', 450, yPosition);
      }
      yPosition += 25;
      if (yPosition > 750) return;  // Prevent overflow
    });

    doc.end();
  } catch (error) {
    console.error('PDF Export error:', error);
    res.status(500).json({ success: false, message: 'PDF generation failed: ' + error.message });
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
