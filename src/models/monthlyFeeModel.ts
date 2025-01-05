import mongoose from "mongoose";

const status = {
  PENDING: "pending",
  PAID: "paid",
  LATE: "late",
};

const monthlyFeeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    planId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MonthlyPlan",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    dueDate: {
      type: Date,
      required: true
    },
    paidAt: {
      type: Date,
    },
    status: {
      type: String,
      enum: Object.values(status),
      default: status.PENDING,
    },
    paymentMethod: {
      type: String,
      enum: ["cash", "card", "transfer"],
      required: function (this: any) {
        return this.status === status.PAID;
      },
    },
    transactionId: {
      type: String,
    },
    notes: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Índices para melhorar a performance das consultas
monthlyFeeSchema.index({ userId: 1, dueDate: -1 });
monthlyFeeSchema.index({ status: 1 });

export const MonthlyFee = mongoose.model("MonthlyFee", monthlyFeeSchema);
