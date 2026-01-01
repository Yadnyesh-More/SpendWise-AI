import express from 'express';
import PDFDocument from 'pdfkit';
import Transaction from '../models/Transaction.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// ✅ PDF EXPORT
router.get('/pdf/:month?', auth, async (req, res) => {
  try {
    const { userId } = req.user;
    const { month } = req.params;
    
    const transactions = await Transaction.find({ userId }).sort({ date: -1 }).limit(100);
    
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
      const typeIcon = tx.type === 1 ? '💸' : '💰';
      doc.fontSize(11)
        .fillColor(tx.isFlagged ? '#EF4444' : '#6B7280')
        .text(`${typeIcon} ${new Date(tx.date).toLocaleDateString()} | ₹${tx.amount.toLocaleString()} | ${tx.description}`, 60, yPosition);
      
      if (tx.isFlagged) {
        doc.fillColor('#EF4444').text('⚠️ Fraud Alert', 450, yPosition);
      }
      yPosition += 25;
    });

    doc.end();
  } catch (error) {
    console.error('PDF Export error:', error);
    res.status(500).json({ success: false, message: 'PDF generation failed' });
  }
});

// ✅ CSV EXPORT
router.get('/csv/:month?', auth, async (req, res) => {
  try {
    const { userId } = req.user;
    const transactions = await Transaction.find({ userId });

    const csvData = transactions.map(tx => ({
      Date: new Date(tx.date).toLocaleDateString(),
      Amount: tx.amount,
      Type: tx.type === 1 ? 'Expense' : 'Income',
      Category: tx.category,
      Description: tx.description,
      Merchant: tx.merchant || ''
    }));

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=budget-${req.params.month || 'all'}.csv`);
    
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
