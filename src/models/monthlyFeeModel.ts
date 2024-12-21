import mongoose from "mongoose";

const status = {
  PENDING: "pending",
  PAID: "paid",
  LATE: "late",
};

const monthlyFeeSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    plan: {
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
    },
    paymentDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: Object.values(status),
      default: status.PENDING,
    },
    paymentMethod: {
      type: String,
      enum: "cash",
      required: function (this: any) {
        return this.status === status.PAID;
      },
    },
    notes: {
      type: String,
    },
  },
  {
    timestamps: true,
    collection: "MonthlyFees",
  }
);

const MonthlyFee = mongoose.model("MonthlyFee", monthlyFeeSchema);

export { MonthlyFee, status };
