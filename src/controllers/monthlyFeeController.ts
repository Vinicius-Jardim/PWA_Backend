import { Request, Response } from "express";
import { MonthlyFeeService } from "../services/controller/monthlyFeeService";

export const MonthlyFeeController = {
    createMonthlyFee: async (req: Request, res: Response): Promise<void> => {
        try {
            const planId = req.params.planId;
            const studentId = req.user.id;
            const response = await MonthlyFeeService.createMonthlyFee(studentId, planId);
            res.status(200).json(response);
        } catch (error) {
            console.error("Error in createMonthlyFee controller:", error);
            res.status(500).json({
                message: "Error creating monthly fee",
                error: error instanceof Error ? error.message : String(error),
            });
        }
    },

    markAsPaid: async (req: Request, res: Response): Promise<void> => {
        try {
            const { paymentMethod } = req.body;
            const { monthlyFeeId } = req.params;
            const response = await MonthlyFeeService.markAsPaid(monthlyFeeId, paymentMethod);
            res.status(200).json(response);
        } catch (error) {
            console.error("Error in markAsPaid controller:", error);
            res.status(500).json({
                message: "Error marking fee as paid",
                error: error instanceof Error ? error.message : String(error),
            });
        }
    },

    getOwnMonthlyFees: async (req: Request, res: Response): Promise<void> => {
        try {
            const studentId = req.user.id;
            const response = await MonthlyFeeService.getOwnMonthlyFees(studentId);
            res.status(200).json(response);
        } catch (error) {
            console.error("Error in getOwnMonthlyFees controller:", error);
            res.status(500).json({
                message: "Error getting monthly fees",
                error: error instanceof Error ? error.message : String(error),
            });
        }
    }
};
