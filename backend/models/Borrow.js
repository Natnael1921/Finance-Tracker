import mongoose from 'mongoose';

const borrowSchema = new mongoose.Schema(
  {
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0.01, 'Amount must be positive'],
    },
    fromWhom: {
      type: String,
      required: [true, 'Lender name is required'],
      trim: true,
    },
    dueDate: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: ['pending', 'paid'],
      default: 'pending',
    },
    notes: {
      type: String,
      trim: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

const Borrow = mongoose.model('Borrow', borrowSchema);
export default Borrow;
