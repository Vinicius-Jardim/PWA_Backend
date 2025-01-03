import { Request, Response } from "express";
import { MonthlyFeeService } from "../services/controller/monthlyFeeService";

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role: string;
  };
}

export const MonthlyFeeController = {
  getMyFees: async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      const result = await MonthlyFeeService.getByUserId(userId);
      res.status(200).json(result);
    } catch (error) {
      console.error("Error in getMyFees:", error);
      res.status(500).json({
        message: "Error fetching monthly fees",
        error: error instanceof Error ? error.message : String(error),
      });
    }
  },

  getAthletesFees: async (req: AuthenticatedRequest, res: Response) => {
    try {
      // Verificar se o usuário é instrutor
      if (req.user?.role !== "INSTRUCTOR") {
        return res.status(403).json({ message: "Unauthorized access" });
      }

      const result = await MonthlyFeeService.getAllAthletesFees();
      res.status(200).json(result);
    } catch (error) {
      console.error("Error in getAthletesFees:", error);
      res.status(500).json({
        message: "Error fetching athletes fees",
        error: error instanceof Error ? error.message : String(error),
      });
    }
  },

  markAsPaid: async (req: AuthenticatedRequest, res: Response) => {
    try {
      // Verificar se o usuário é instrutor
      if (req.user?.role !== "INSTRUCTOR") {
        return res.status(403).json({ message: "Unauthorized access" });
      }

      const feeId = req.params.id;
      const instructorId = req.user?.id;
      
      if (!instructorId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const result = await MonthlyFeeService.markAsPaid(feeId, instructorId);
      res.status(200).json(result);
    } catch (error) {
      console.error("Error in markAsPaid:", error);
      res.status(500).json({
        message: "Error marking fee as paid",
        error: error instanceof Error ? error.message : String(error),
      });
    }
  },

  getPaymentHistory: async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const result = await MonthlyFeeService.getPaymentHistory(userId);
      res.status(200).json(result);
    } catch (error) {
      console.error("Error in getPaymentHistory:", error);
      res.status(500).json({
        message: "Error fetching payment history",
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }
};
