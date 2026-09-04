import express from 'express';
import {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getStats,
} from '../controllers/transactionController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect); // All transaction routes require auth

router.get('/stats', getStats);
router.get('/', getTransactions);
router.post('/', createTransaction);
router.put('/:id', updateTransaction);
router.delete('/:id', deleteTransaction);

export default router;
