import { Request, Response } from "express";
import { ExameService } from "../services/controller/exameService";

export const ExameController = {
  create: async (req: Request, res: Response) => {
    try {
      // Validar os campos necessários
      const { name, date, beltLevel, maxParticipants } = req.body;

      if (!name || !date || !beltLevel || !maxParticipants) {
        return res.status(400).json({
          message: "Campos obrigatórios faltando: nome, data e nível da faixa",
        });
      }

      // Passar os dados validados ao serviço
      const result = await ExameService.create(req.body, req.user);

      return res.status(201).json({ message: "Exame criado com sucesso", exam: result });
    } catch (error) {
      console.error("Erro durante a criação do exame:", error);

      // Handle specific error cases
      if (error instanceof Error) {
        if (error.message.includes("Faixas inválidas")) {
          return res.status(400).json({ 
            message: "Faixas inválidas fornecidas",
            details: error.message
          });
        }
        if (error.message.includes("validation failed")) {
          return res.status(400).json({ message: "Dados do exame inválidos" });
        }
      }

      return res.status(500).json({ message: "Erro interno do servidor" });
    }
  },

  own: async (req: Request, res: Response) => {
    try {
      const instructor = {
        id: req.user.id, // Assumindo que o usuário está autenticado
        role: req.user.role,
      };
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const result = await ExameService.getOwnExams(instructor, page, limit);

      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ error: error });
    }
  },

  all: async (req: Request, res: Response) => {
    try {
      // Extrair os parâmetros de consulta
      const page = parseInt(req.query.page as string) || 1; // Página padrão: 1
      const limit = parseInt(req.query.limit as string) || 10; // Limite padrão: 10
      const beltLevel = req.query.beltLevel as string; // Nível de faixa

      // Construir filtros baseados em beltLevel
      const filters = beltLevel ? { beltLevel } : {};

      // Buscar os exames com os filtros, paginação e limite
      const result = await ExameService.getAllExams(filters, page, limit);

      // Responder com o resultado
      res.status(200).json(result);
    } catch (error) {
      console.error("Error in getAllExams controller:", error);
      res.status(500).json({
        message: "Falha ao buscar exames",
        error: error instanceof Error ? error.message : "Erro desconhecido",
      });
    }
  },

  register: async (req: Request, res: Response) => {
    try {
      const examId = req.params.id;
      const athleteId = req.user.id;

      const response = await ExameService.registerForExam(examId, athleteId);
      res.status(200).json(response);
    } catch (error) {
      console.error("Erro ao registrar no exame:", error);
      res.status(400).json({
        message:
          error instanceof Error
            ? error.message
            : "Falha ao registrar no exame",
      });
    }
  },

  unregister: async (req: Request, res: Response) => {
    try {
      const examId = req.params.id;
      const athleteId = req.user.id;

      const response = await ExameService.unregisterFromExam(examId, athleteId);
      res.status(200).json(response);
    } catch (error) {
      console.error("Erro ao cancelar inscrição no exame:", error);
      res.status(400).json({
        message:
          error instanceof Error
            ? error.message
            : "Falha ao cancelar inscrição no exame",
      });
    }
  },

  myExams: async (req: Request, res: Response) => {
    try {
      const athleteId = req.user.id;
      const exams = await ExameService.getAthleteExams(athleteId);
      res.status(200).json(exams);
    } catch (error) {
      console.error("Erro ao buscar exames do atleta:", error);
      res.status(500).json({
        message: "Falha ao buscar exames",
      });
    }
  },

  updateResult: async (req: Request, res: Response) => {
    try {
      const { examId, athleteId, grade } = req.body;

      if (!examId || !athleteId || !grade) {
        return res.status(400).json({
          message: "Campos obrigatórios faltando: examId, athleteId e nota",
        });
      }

      const result = await ExameService.updateExamResult(
        examId,
        athleteId,
        grade
      );
      res.status(200).json(result);
    } catch (error) {
      console.error("Erro ao atualizar resultado do exame:", error);
      res.status(400).json({
        message:
          error instanceof Error
            ? error.message
            : "Falha ao atualizar resultado do exame",
      });
    }
  },
};
