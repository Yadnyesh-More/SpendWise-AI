import express from 'express';
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

router.use(authMiddleware);

router.post('/', createTransaction);
router.get('/', getTransactions);
router.get('/summary', getSummary);
router.get('/months/list', getMonthsList);
router.get('/analytics', getAnalytics);
router.delete('/:id', deleteTransaction);

export default router;
