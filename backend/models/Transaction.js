import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['income', 'expense'],
      required: [true, 'Transaction type is required'],
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0.01, 'Amount must be positive'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
    },
    reason: {
      type: String,
      trim: true,
    },
    cashSource: {
      type: String,
      enum: ['personal', 'company', 'borrowed'],
      required: [true, 'Cash source is required'],
    },
    description: {
      type: String,
      trim: true,
    },
    borrowRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Borrow',
      default: null,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

const Transaction = mongoose.model('Transaction', transactionSchema);
export default Transaction;
