import { Request, Response } from "express";
import { MonthlyPlan } from "../models/monthlyPlanModel";
import { MonthlyFee } from "../models/monthlyFeeModel";
import { MonthlyPlanService } from "../services/controller/monthlyPlanService";

export const MonthlyPlanController = {
  add: async (req: Request, res: Response) => {
    try {
      const data = {
        name: req.body.name,
        price: req.body.price,
        description: req.body.description,
        studentCapacity: req.body.studentCapacity,
        privateLessonsIncluded: req.body.privateLessonsIncluded,
        weeklyClasses: req.body.weeklyClasses,
        graduationScopes: req.body.graduationScopes,
        duration: req.body.duration,
      };
      const response = await MonthlyPlanService.add(data);
      res.status(200).json(response);
    } catch (error) {
      console.error("Erro ao adicionar plano mensal:", error);
      res.status(400).json({
        message: error instanceof Error ? error.message : "Erro ao adicionar plano mensal",
      });
    }
  },

  all: async (req: Request, res: Response) => {
    try {
      const response = await MonthlyPlanService.all();
      res.status(200).json(response);
    } catch (error) {
      console.error("Erro ao buscar planos mensais:", error);
      res.status(400).json({
        message: error instanceof Error ? error.message : "Erro ao buscar planos mensais",
      });
    }
  },

  update: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const plan = await MonthlyPlan.findByIdAndUpdate(id, req.body, { new: true });
      if (!plan) {
        return res.status(404).json({ message: "Plano não encontrado" });
      }
      res.json(plan);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  choosePlan: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      // Verifica se o plano existe
      const plan = await MonthlyPlan.findById(id);
      if (!plan) {
        return res.status(404).json({ message: 'Plano não encontrado' });
      }

      // Verifica se já existe uma mensalidade ativa para este usuário
      const existingFee = await MonthlyFee.findOne({
        userId: userId,
        status: { $in: ['pending', 'late'] }
      });

      if (existingFee) {
        return res.status(400).json({ 
          message: 'Você já possui uma mensalidade pendente ou atrasada' 
        });
      }

      // Calcula a data de vencimento (30 dias a partir de hoje)
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 30);

      // Cria uma nova mensalidade para o atleta
      const monthlyFee = new MonthlyFee({
        userId: userId,
        planId: id,
        amount: plan.price,
        dueDate: dueDate,
        status: 'pending',
        notes: `Plano: ${plan.name}`
      });

      await monthlyFee.save();

      res.json({ 
        success: true, 
        message: 'Plano escolhido com sucesso',
        monthlyFee 
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
};