import { MonthlyFee } from "../../models/monthlyFeeModel";

export const MonthlyFeeService = {
  getByUserId: async (userId: string) => {
    try {
      const fees = await MonthlyFee.find({ userId })
        .sort({ dueDate: -1 })
        .populate('planId', 'name price');
      return fees;
    } catch (error) {
      throw error;
    }
  },

  getAllAthletesFees: async () => {
    try {
      const fees = await MonthlyFee.find()
        .sort({ dueDate: -1 })
        .populate('userId', 'name')
        .populate('planId', 'name price');
      return fees;
    } catch (error) {
      throw error;
    }
  },

  markAsPaid: async (feeId: string) => {
    try {
      const fee = await MonthlyFee.findByIdAndUpdate(
        feeId,
        {
          $set: {
            status: 'paid',
            paidAt: new Date()
          }
        },
        { new: true }
      )
        .populate('userId', 'name')
        .populate('planId', 'name price');
      
      if (!fee) {
        throw new Error('Monthly fee not found');
      }

      return fee;
    } catch (error) {
      throw error;
    }
  }
};
