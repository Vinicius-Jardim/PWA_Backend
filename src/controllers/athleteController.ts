import { Request, Response } from "express";
import User, { roles, belts } from "../models/userModel";
import { MonthlyFee } from "../models/monthlyFeeModel";
import { AthleteService } from "../services/controller/atheleteService";
import { sendEmail } from "../utils/emailService";

export const AthleteController = {
  // Listar atletas com paginação
  getAthletes: async (req: Request, res: Response) => {
    try {
      // Extrair dados de consulta (query params)
      const params = {
        search: (req.query.search as string) || "",
        page: parseInt(req.query.page as string) || 1,
        pageSize: parseInt(req.query.pageSize as string) || 10
      };

      // Buscar atletas
      const result = await AthleteService.getAthletes(params);

      // Enviar resposta
      res.status(200).json(result);
    } catch (error) {
      console.error("Erro ao buscar atletas:", error);
      res.status(500).json({
        message: "Erro ao buscar atletas",
        error: error instanceof Error ? error.message : error
      });
    }
  },

  // Listar atletas com mensalidades
  getAthletesWithFees: async (req: Request, res: Response) => {
    try {
      // Extrair dados de consulta (query params)
      const params = {
        search: (req.query.search as string) || "",
        page: parseInt(req.query.page as string) || 1,
        pageSize: parseInt(req.query.pageSize as string) || 10
      };

      // Buscar atletas
      const athletes = await User.find({ role: roles.ATHLETE })
        .select('-payments') // Remove apenas o campo payments
        .skip((params.page - 1) * params.pageSize)
        .limit(params.pageSize)
        .lean();

      // Buscar mensalidades dos atletas
      const athletesWithFees = await Promise.all(
        athletes.map(async (athlete) => {
          // Buscar a mensalidade mais recente do atleta, independente do status
          const currentFee = await MonthlyFee.findOne({
            userId: athlete._id
          })
          .sort({ createdAt: -1 }) // Pega a mais recente
          .populate('planId', 'name price') // Popula os dados do plano
          .lean();

          return {
            ...athlete,
            currentFee,
            hasPendingPayment: currentFee?.status !== 'paid'
          };
        })
      );

      // Contar total de atletas
      const totalCount = await User.countDocuments({ role: roles.ATHLETE });

      // Enviar resposta
      res.status(200).json({
        athletes: athletesWithFees,
        currentPage: params.page,
        totalPages: Math.ceil(totalCount / params.pageSize),
        totalCount
      });
    } catch (error) {
      console.error("Erro ao buscar atletas:", error);
      res.status(500).json({
        message: "Erro ao buscar atletas",
        error: error instanceof Error ? error.message : error
      });
    }
  },

  // Atualizar faixa do atleta
  updateBelt: async (req: Request, res: Response) => {
    try {
      const { athleteId } = req.params;
      const { belt } = req.body;

      // Verificar se a faixa é válida
      if (!Object.values(belts).includes(belt)) {
        return res.status(400).json({
          message: "Faixa inválida. Faixas válidas: " + Object.values(belts).join(", ")
        });
      }

      // Atualizar a faixa do atleta
      const athlete = await User.findById(athleteId);
      if (!athlete || athlete.role !== roles.ATHLETE) {
        return res.status(404).json({
          message: "Atleta não encontrado"
        });
      }

      athlete.belt = belt;
      await athlete.save();

      res.status(200).json({
        message: "Faixa atualizada com sucesso",
        athlete
      });
    } catch (error) {
      console.error("Erro ao atualizar faixa:", error);
      res.status(500).json({
        message: "Erro ao atualizar faixa",
        error: error instanceof Error ? error.message : error
      });
    }
  },

  // Suspender atleta
  suspendAthlete: async (req: Request, res: Response) => {
    try {
      const { athleteId } = req.params;

      const athlete = await User.findById(athleteId);
      if (!athlete || athlete.role !== roles.ATHLETE) {
        return res.status(404).json({
          message: "Atleta não encontrado"
        });
      }

      athlete.suspended = true;
      await athlete.save();

      res.status(200).json({
        message: "Atleta suspenso com sucesso",
        athlete
      });
    } catch (error) {
      console.error("Erro ao suspender atleta:", error);
      res.status(500).json({
        message: "Erro ao suspender atleta",
        error: error instanceof Error ? error.message : error
      });
    }
  },

  // Enviar lembrete de pagamento
  sendPaymentReminder: async (req: Request, res: Response) => {
    try {
      const { athleteId } = req.params;

      const athlete = await User.findById(athleteId);
      if (!athlete || athlete.role !== roles.ATHLETE) {
        return res.status(404).json({
          message: "Atleta não encontrado"
        });
      }

      // Buscar mensalidade pendente
      const pendingFee = await MonthlyFee.findOne({
        userId: athlete._id,
        status: { $ne: "paid" }
      }).sort({ dueDate: 1 });

      if (!pendingFee) {
        return res.status(404).json({
          message: "Nenhuma mensalidade pendente encontrada"
        });
      }

      // Enviar email de lembrete
      await sendEmail({
        to: athlete.email,
        subject: "Lembrete de Pagamento",
        text: `Olá ${athlete.name},\n\nEste é um lembrete sobre sua mensalidade pendente no valor de €${pendingFee.amount}, com vencimento em ${new Date(pendingFee.dueDate).toLocaleDateString()}.\n\nPor favor, regularize seu pagamento o mais breve possível.\n\nAtenciosamente,\nEquipe Academia`
      });

      res.status(200).json({
        message: "Lembrete enviado com sucesso"
      });
    } catch (error) {
      console.error("Erro ao enviar lembrete:", error);
      res.status(500).json({
        message: "Erro ao enviar lembrete",
        error: error instanceof Error ? error.message : error
      });
    }
  }
};
