import Transaction from '../models/Transaction.js';
import Borrow from '../models/Borrow.js';

// @desc   Get all transactions with optional filters
// @route  GET /api/transactions
// @access Private
export const getTransactions = async (req, res) => {
  try {
    const { type, category, cashSource, search, page = 1, limit = 20 } = req.query;
    const filter = {};

    if (type) filter.type = type;
    if (category) filter.category = { $regex: category, $options: 'i' };
    if (cashSource) filter.cashSource = cashSource;
    if (search) {
      filter.$or = [
        { category: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { reason: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await Transaction.countDocuments(filter);
    const transactions = await Transaction.find(filter)
      .populate('createdBy', 'name email role')
      .populate('borrowRef')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({
      success: true,
      count: transactions.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      transactions,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc   Get dashboard summary stats
// @route  GET /api/transactions/stats
// @access Private
export const getStats = async (req, res) => {
  try {
    const [result] = await Transaction.aggregate([
      {
        $group: {
          _id: null,
          totalIncome: { $sum: { $cond: [{ $eq: ['$type', 'income'] }, '$amount', 0] } },
          totalExpense: { $sum: { $cond: [{ $eq: ['$type', 'expense'] }, '$amount', 0] } },
          totalTransactions: { $sum: 1 },
        },
      },
    ]);

    const pendingBorrows = await Borrow.aggregate([
      { $match: { status: 'pending' } },
      { $group: { _id: null, totalPending: { $sum: '$amount' }, count: { $sum: 1 } } },
    ]);

    const stats = result || { totalIncome: 0, totalExpense: 0, totalTransactions: 0 };
    const balance = stats.totalIncome - stats.totalExpense;

    res.json({
      success: true,
      stats: {
        totalIncome: stats.totalIncome,
        totalExpense: stats.totalExpense,
        balance,
        totalTransactions: stats.totalTransactions,
        pendingBorrow: pendingBorrows[0]?.totalPending || 0,
        pendingBorrowCount: pendingBorrows[0]?.count || 0,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc   Create transaction
// @route  POST /api/transactions
// @access Private
export const createTransaction = async (req, res) => {
  try {
    const { type, amount, category, reason, cashSource, description, borrowData } = req.body;

    let borrowRef = null;

    // If cash source is borrowed, auto-create a borrow record
    if (cashSource === 'borrowed' && borrowData) {
      const borrow = await Borrow.create({
        amount,
        fromWhom: borrowData.fromWhom,
        dueDate: borrowData.dueDate || null,
        notes: borrowData.notes || '',
        createdBy: req.user._id,
      });
      borrowRef = borrow._id;
    }

    const transaction = await Transaction.create({
      type,
      amount,
      category,
      reason,
      cashSource,
      description,
      borrowRef,
      createdBy: req.user._id,
    });

    const populated = await transaction.populate('createdBy', 'name email role');

    // Emit realtime event
    req.io.emit('transaction-added', populated);

    res.status(201).json({ success: true, transaction: populated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc   Update transaction
// @route  PUT /api/transactions/:id
// @access Private
export const updateTransaction = async (req, res) => {
  try {
    let transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }

    transaction = await Transaction.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('createdBy', 'name email role');

    // Emit realtime event
    req.io.emit('transaction-updated', transaction);

    res.json({ success: true, transaction });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc   Delete transaction
// @route  DELETE /api/transactions/:id
// @access Private
export const deleteTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }

    // Remove linked borrow record if exists
    if (transaction.borrowRef) {
      await Borrow.findByIdAndDelete(transaction.borrowRef);
    }

    await transaction.deleteOne();

    // Emit realtime event
    req.io.emit('transaction-deleted', { id: req.params.id });

    res.json({ success: true, message: 'Transaction deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
