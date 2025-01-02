import { Request, Response } from "express";
import { ExameService } from "../services/controller/exameService";
import { Exam } from "../models/examModel"; // Import the Exam model
import { User } from "../models/userModel"; // Import the User model

export const ExameController = {
  create: async (req: Request, res: Response) => {
    try {
      // Validar os campos necessários
      const { name, date, beltLevel, maxParticipants, description } = req.body;

      if (!name || !date || !beltLevel) {
        return res.status(400).json({ message: "Campos obrigatórios faltando" });
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
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = req.query.search as string;
      const beltLevel = req.query.beltLevel as string;
      const instructor = req.query.instructor as string;

      // Construir filtros
      const filters: any = {};
      
      if (search) {
        filters.name = search;
      }
      
      if (beltLevel) {
        filters.beltLevel = beltLevel;
      }

      if (instructor) {
        filters.instructorName = instructor;
      }

      const result = await ExameService.getAllExams(filters, page, limit);
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
      const { examId, athleteId, grade, observations } = req.body;

      if (!examId || !athleteId || !grade) {
        return res.status(400).json({
          message: "Campos obrigatórios faltando: examId, athleteId e nota",
        });
      }

      const result = await ExameService.updateExamResult(
        examId,
        athleteId,
        grade,
        observations
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

  getParticipants: async (req: Request, res: Response) => {
    try {
      const examId = req.params.id;
      const participants = await ExameService.getExamParticipants(examId);
      res.status(200).json(participants);
    } catch (error) {
      console.error("Erro ao buscar participantes do exame:", error);
      res.status(400).json({
        message:
          error instanceof Error
            ? error.message
            : "Falha ao buscar participantes do exame",
      });
    }
  },

  update: async (req: Request, res: Response) => {
    try {
      const { name, date, location, belt, maxParticipants, description } = req.body;
      const examId = req.params.id;
      const userId = req.user?.id;

      console.log('Dados recebidos:', {
        name,
        date,
        location,
        belt,
        maxParticipants,
        description,
        examId,
        userId
      });

      // Validar se os campos existem e não são vazios
      if (!name?.trim() || !date || !location?.trim() || !belt?.trim()) {
        console.log('Campos faltando:', {
          name: !name?.trim(),
          date: !date,
          location: !location?.trim(),
          belt: !belt?.trim()
        });
        return res.status(400).json({ 
          message: 'Campos obrigatórios faltando',
          missing: {
            name: !name?.trim(),
            date: !date,
            location: !location?.trim(),
            belt: !belt?.trim()
          }
        });
      }

      const exam = await Exam.findById(examId);
      if (!exam) {
        return res.status(404).json({ message: 'Exame não encontrado' });
      }

      if (exam.instructor.toString() !== userId) {
        return res.status(403).json({ message: 'Não autorizado' });
      }

      // Se houver participantes, não permite alterar a data
      if (exam.participants && exam.participants.length > 0 && new Date(exam.date).getTime() !== new Date(date).getTime()) {
        return res.status(400).json({ message: 'Não é possível alterar a data de um exame com participantes' });
      }

      const updatedExam = await Exam.findByIdAndUpdate(
        examId,
        {
          name: name.trim(),
          date: new Date(date),
          location: location.trim(),
          belt: belt.trim(),
          maxParticipants: Number(maxParticipants) || 10,
          description: description?.trim()
        },
        { new: true }
      );

      res.json(updatedExam);
    } catch (error) {
      console.error('Erro ao atualizar exame:', error);
      res.status(500).json({ message: 'Erro ao atualizar exame' });
    }
  },

  delete: async (req: Request, res: Response) => {
    try {
      const examId = req.params.id;
      await ExameService.deleteExam(examId, req.user.id);
      res.status(200).json({ message: "Exame deletado com sucesso" });
    } catch (error) {
      console.error("Erro ao deletar exame:", error);
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Erro interno do servidor" });
      }
    }
  },

  updateBelt: async (req: Request, res: Response) => {
    try {
      const examId = req.params.examId;
      const athleteId = req.params.athleteId;

      await ExameService.updateUserBelt(examId, athleteId);
      res.status(200).json({ message: "Faixa do atleta atualizada com sucesso" });
    } catch (error) {
      console.error("Erro ao atualizar faixa do atleta:", error);
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Erro interno do servidor" });
      }
    }
  }
};
