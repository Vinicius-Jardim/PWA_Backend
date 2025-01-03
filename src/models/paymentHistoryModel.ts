import mongoose from "mongoose";

const paymentHistorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    monthlyFeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MonthlyFee",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    paidAt: {
      type: Date,
      required: true,
    },
    markedByUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const PaymentHistory = mongoose.model("PaymentHistory", paymentHistorySchema);
