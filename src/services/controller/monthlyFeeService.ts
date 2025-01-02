import { MonthlyFee } from "../../models/monthlyFeeModel";
import User from "../../models/userModel";

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
      // Primeiro encontra a mensalidade
      const fee = await MonthlyFee.findById(feeId);
      if (!fee) {
        throw new Error('Monthly fee not found');
      }

      // Atualiza o status do usuário primeiro
      const updatedUser = await User.findByIdAndUpdate(
        fee.userId,
        { suspended: false },
        { new: true }
      );

      if (!updatedUser) {
        throw new Error('User not found');
      }

      // Depois atualiza a mensalidade
      const updatedFee = await MonthlyFee.findByIdAndUpdate(
        feeId,
        {
          status: 'paid',
          paidAt: new Date()
        },
        { new: true }
      )
        .populate('userId')
        .populate('planId', 'name price');

      if (!updatedFee) {
        throw new Error('Error updating fee');
      }

      // Força a atualização do status do usuário
      await User.updateOne(
        { _id: fee.userId },
        { $set: { suspended: false } }
      );

      return {
        ...updatedFee.toObject(),
        userId: {
          ...updatedFee.userId,
          suspended: false
        }
      };
    } catch (error) {
      throw error;
    }
  }
};
