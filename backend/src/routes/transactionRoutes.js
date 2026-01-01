import express from 'express';
import { detectFraud } from '../middleware/fraudDetection.js';
import {
  createTransaction,
  getTransactions,
  getSummary,
  getMonthsList,
  getAnalytics,
  deleteTransaction,
} from '../controllers/transactionController.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();
router.post('/transactions', detectFraud, createTransaction);
router.use(authMiddleware);

router.post('/', createTransaction);
router.get('/', getTransactions);
router.get('/summary', getSummary);
router.get('/months/list', getMonthsList);
router.get('/analytics', getAnalytics);
router.delete('/:id', deleteTransaction);
router.get('/fraud-alerts', getFraudAlerts);

export default router;
