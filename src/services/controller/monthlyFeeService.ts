import { MonthlyFee } from "../../models/monthlyFeeModel";
import User from "../../models/userModel";
import { PaymentHistory } from "../../models/paymentHistoryModel";

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

  markAsPaid: async (feeId: string, instructorId: string) => {
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

      const paidAt = new Date();

      // Atualiza a mensalidade
      const updatedFee = await MonthlyFee.findByIdAndUpdate(
        feeId,
        {
          status: 'paid',
          paidAt
        },
        { new: true }
      ).populate('userId').populate('planId');

      // Cria o registro no histórico
      await PaymentHistory.create({
        userId: fee.userId,
        monthlyFeeId: feeId,
        amount: fee.amount,
        paidAt,
        markedByUserId: instructorId
      });

      return updatedFee;
    } catch (error) {
      throw error;
    }
  },

  getPaymentHistory: async (userId: string) => {
    try {
      const history = await PaymentHistory.find({ userId })
        .sort({ paidAt: -1 })
        .populate({
          path: 'monthlyFeeId',
          populate: {
            path: 'planId',
            select: 'name'
          }
        })
        .populate('markedByUserId', 'name');
      return history;
    } catch (error) {
      throw error;
    }
  }
};
