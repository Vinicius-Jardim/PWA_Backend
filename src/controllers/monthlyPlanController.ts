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
      const plans = await MonthlyPlan.find();
      
      // Se o usuário for instrutor, adiciona contagem de solicitações pendentes
      if (req.user.role === 'INSTRUCTOR') {
        const plansWithRequests = await Promise.all(plans.map(async (plan) => {
          const pendingRequests = await MonthlyFee.countDocuments({
            planId: plan._id,
            status: 'pending'
          });
          
          return {
            ...plan.toObject(),
            pendingRequests
          };
        }));
        
        return res.status(200).json(plansWithRequests);
      }
      
      res.status(200).json(plans);
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
  },

  current: async (req: Request, res: Response) => {
    try {
      const userId = req.user.id;

      // Busca a mensalidade mais recente do usuário
      const currentFee = await MonthlyFee.findOne({
        userId: userId,
        status: { $in: ['pending', 'paid'] }
      }).sort({ createdAt: -1 }).populate('planId');

      if (!currentFee) {
        return res.status(404).json({ message: 'Nenhum plano atual encontrado' });
      }

      const plan = currentFee.planId;
      if (!plan) {
        return res.status(404).json({ message: 'Plano não encontrado' });
      }

      res.json({
        ...plan.toObject(),
        status: currentFee.status === 'paid' ? 'ACCEPTED' : 'PENDING'
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  getPlanRequests: async (req: Request, res: Response) => {
    try {
      const { planId } = req.params;

      // Verifica se o usuário é instrutor
      if (req.user.role !== 'INSTRUCTOR') {
        return res.status(403).json({ message: 'Acesso não autorizado' });
      }

      // Busca todas as solicitações pendentes para o plano
      const requests = await MonthlyFee.find({
        planId,
        status: 'pending'
      }).populate('userId', 'name email');

      res.json(requests);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  acceptPlanRequest: async (req: Request, res: Response) => {
    try {
      const { feeId } = req.params;

      // Verifica se o usuário é instrutor
      if (req.user.role !== 'INSTRUCTOR') {
        return res.status(403).json({ message: 'Acesso não autorizado' });
      }

      const fee = await MonthlyFee.findById(feeId);
      if (!fee) {
        return res.status(404).json({ message: 'Solicitação não encontrada' });
      }

      // Atualiza o status da mensalidade para pago
      fee.status = 'paid';
      fee.paidAt = new Date();
      await fee.save();

      res.json({ message: 'Solicitação aceita com sucesso' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
};