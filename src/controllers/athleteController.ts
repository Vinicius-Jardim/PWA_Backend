import { Request, Response } from "express";
import User, { roles, belts } from "../models/userModel";
import { MonthlyFee } from "../models/monthlyFeeModel";
import { AthleteService } from "../services/controller/atheleteService";
import { sendEmail } from "../utils/emailService";
import { ExamNotificationService } from "../services/examNotificationService";

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

      // Construir query de busca
      const searchQuery = params.search ? {
        $or: [
          { name: { $regex: params.search, $options: 'i' } },
          { email: { $regex: params.search, $options: 'i' } }
        ]
      } : {};

      // Buscar atletas
      const athletes = await User.find({ 
        role: roles.ATHLETE,
        ...searchQuery
      })
        .select('-payments')
        .skip((params.page - 1) * params.pageSize)
        .limit(params.pageSize)
        .lean();

      // Buscar mensalidades dos atletas
      const athletesWithFees = await Promise.all(
        athletes.map(async (athlete) => {
          // Buscar a mensalidade mais recente do atleta
          const currentFee = await MonthlyFee.findOne({
            userId: athlete._id
          })
          .sort({ createdAt: -1 })
          .populate('planId', 'name price')
          .lean();

          // Se a mensalidade está paga, atualiza o status do usuário
          if (currentFee?.status === 'paid') {
            await User.findByIdAndUpdate(athlete._id, { suspended: false });
            athlete.suspended = false;
          }

          return {
            ...athlete,
            currentFee,
            // Só tem pagamento pendente se tiver um plano E o status não for 'paid'
            hasPendingPayment: currentFee ? currentFee.status !== 'paid' : false
          };
        })
      );

      // Contar total de atletas
      const totalCount = await User.countDocuments({ role: roles.ATHLETE, ...searchQuery });

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
      const { belt: newBelt } = req.body;

      // Verificar se a faixa é válida
      if (!Object.values(belts).includes(newBelt)) {
        return res.status(400).json({
          message: "Faixa inválida. Faixas válidas: " + Object.values(belts).join(", ")
        });
      }

      // Atualizar a faixa do atleta
      const updatedAthlete = await User.findByIdAndUpdate(
        athleteId,
        { belt: newBelt },
        { new: true }
      );

      // Verificar e notificar sobre exames elegíveis
      await ExamNotificationService.checkAndNotifyEligibleExams(athleteId, newBelt);

      res.status(200).json({
        message: "Faixa atualizada com sucesso",
        athlete: updatedAthlete
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

      // Atualiza o status do atleta para suspenso
      athlete.suspended = true;
      await athlete.save();

      // Busca e atualiza a mensalidade atual para pending
      const currentFee = await MonthlyFee.findOne({ 
        userId: athleteId 
      }).sort({ createdAt: -1 });

      if (currentFee) {
        currentFee.status = "pending";
        currentFee.paidAt = undefined;
        await currentFee.save();
      }

      // Busca o atleta atualizado com a mensalidade
      const updatedAthlete = await User.findById(athleteId).lean();
      const updatedFee = await MonthlyFee.findOne({ 
        userId: athleteId 
      })
      .sort({ createdAt: -1 })
      .populate('planId', 'name price')
      .lean();

      res.status(200).json({
        message: "Atleta suspenso com sucesso",
        athlete: {
          ...updatedAthlete,
          currentFee: updatedFee
        }
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

      // Buscar atleta
      const athlete = await User.findById(athleteId);
      if (!athlete) {
        return res.status(404).json({ message: "Atleta não encontrado" });
      }

      // Enviar email
      await sendEmail(
        athlete.email,
        "Lembrete de Pagamento",
        "Olá, este é um lembrete amigável de que você tem um pagamento pendente."
      );

      res.status(200).json({ message: "Lembrete enviado com sucesso" });
    } catch (error) {
      console.error("Erro ao enviar lembrete:", error);
      res.status(500).json({
        message: "Erro ao enviar lembrete",
        error: error instanceof Error ? error.message : error,
      });
    }
  },

  // Deletar atleta
  deleteAthlete: async (req: Request, res: Response) => {
    try {
      const { athleteId } = req.params;

      // Verificar se o atleta existe
      const athlete = await User.findById(athleteId);
      if (!athlete) {
        return res.status(404).json({ message: "Atleta não encontrado" });
      }

      // Verificar se é realmente um atleta
      if (athlete.role !== roles.ATHLETE) {
        return res.status(400).json({ message: "O usuário não é um atleta" });
      }

      // Deletar mensalidades associadas
      await MonthlyFee.deleteMany({ userId: athleteId });

      // Deletar o atleta
      await User.findByIdAndDelete(athleteId);

      res.status(200).json({ message: "Atleta deletado com sucesso" });
    } catch (error) {
      console.error("Erro ao deletar atleta:", error);
      res.status(500).json({
        message: "Erro ao deletar atleta",
        error: error instanceof Error ? error.message : error,
      });
    }
  },
};
