import { Request, Response } from "express";
import { ExamSessionService } from "../services/controller/examSessionService";

export const ExamSessionController = {
  create: async (req: Request, res: Response) => {
    try {
      const { examId, date, time, location, maxParticipants } = req.body;

      if (!examId || !date || !time || !location) {
        return res.status(400).json({ message: "Campos obrigatórios faltando" });
      }

      const session = await ExamSessionService.createSession({
        examId,
        date,
        time,
        location,
        maxParticipants: maxParticipants || 10,
        participants: []
      });

      return res.status(201).json({
        message: "Sessão criada com sucesso",
        session
      });
    } catch (error) {
      console.error("Erro ao criar sessão:", error);
      return res.status(500).json({
        message: "Erro ao criar sessão",
        error: error instanceof Error ? error.message : "Erro desconhecido"
      });
    }
  },

  getByExam: async (req: Request, res: Response) => {
    try {
      const { examId } = req.params;
      const sessions = await ExamSessionService.getSessionsByExam(examId);

      return res.status(200).json(sessions);
    } catch (error) {
      console.error("Erro ao buscar sessões:", error);
      return res.status(500).json({
        message: "Erro ao buscar sessões",
        error: error instanceof Error ? error.message : "Erro desconhecido"
      });
    }
  },

  register: async (req: Request, res: Response) => {
    try {
      const { sessionId } = req.params;
      const athleteId = req.user.id;

      const session = await ExamSessionService.registerForSession(sessionId, athleteId);

      return res.status(200).json({
        message: "Inscrição realizada com sucesso",
        session
      });
    } catch (error) {
      console.error("Erro ao registrar na sessão:", error);
      return res.status(400).json({
        message: "Erro ao registrar na sessão",
        error: error instanceof Error ? error.message : "Erro desconhecido"
      });
    }
  },

  unregister: async (req: Request, res: Response) => {
    try {
      const { sessionId } = req.params;
      const athleteId = req.user.id;

      const session = await ExamSessionService.unregisterFromSession(sessionId, athleteId);

      return res.status(200).json({
        message: "Inscrição cancelada com sucesso",
        session
      });
    } catch (error) {
      console.error("Erro ao cancelar inscrição:", error);
      return res.status(400).json({
        message: "Erro ao cancelar inscrição",
        error: error instanceof Error ? error.message : "Erro desconhecido"
      });
    }
  },

  delete: async (req: Request, res: Response) => {
    try {
      const { sessionId } = req.params;
      await ExamSessionService.deleteSession(sessionId);

      return res.status(200).json({
        message: "Sessão excluída com sucesso"
      });
    } catch (error) {
      console.error("Erro ao excluir sessão:", error);
      return res.status(500).json({
        message: "Erro ao excluir sessão",
        error: error instanceof Error ? error.message : "Erro desconhecido"
      });
    }
  },

  update: async (req: Request, res: Response) => {
    try {
      const { sessionId } = req.params;
      const updateData = req.body;

      const session = await ExamSessionService.updateSession(sessionId, updateData);

      return res.status(200).json({
        message: "Sessão atualizada com sucesso",
        session
      });
    } catch (error) {
      console.error("Erro ao atualizar sessão:", error);
      return res.status(500).json({
        message: "Erro ao atualizar sessão",
        error: error instanceof Error ? error.message : "Erro desconhecido"
      });
    }
  }
};
