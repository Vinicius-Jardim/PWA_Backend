import { Request, Response } from "express";
import { ExameService } from "../services/controller/exameService";

export const ExameController = {
  create: async (req: Request, res: Response) => {
    try {
      // Validar os campos necessários
      const { name, date, beltLevel, maxParticipants } = req.body;
  
      if (!name || !date || !beltLevel || !maxParticipants) {
        return res.status(400).json({
          message: "Missing required fields: name, date, and beltLevel",
        });
      }
  
      // Passar os dados validados ao serviço
      const result = await ExameService.create(req.body, req.user);
  
      return res.status(201).json({ message: "Exam created", exam: result });
    } catch (error) {
      console.error("Error during exam creation:", error);
  
      // Adicionar uma resposta mais específica caso o erro seja de validação
      if (error instanceof Error && error.message.includes("validation failed")) {
        return res.status(400).json({ message: "Invalid exam data provided" });
      }
  
      return res.status(500).json({ message: "Internal server error" });
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
      // Extract query parameters
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = req.query.search as string;
      const beltLevel = req.query.beltLevel as string;
      const startDate = req.query.startDate as string;
      const endDate = req.query.endDate as string;
      const hasVacancy = req.query.hasVacancy === 'true';
      const sortField = (req.query.sortField as string) || 'date';
      const sortOrder = parseInt(req.query.sortOrder as string) || 1;

      // Build filters object
      const filters = {
        ...(search && { search }),
        ...(beltLevel && { beltLevel }),
        ...(startDate && { startDate: new Date(startDate) }),
        ...(endDate && { endDate: new Date(endDate) }),
        ...(req.query.hasVacancy !== undefined && { hasVacancy })
      };

      // Build sort object
      const sort = { [sortField]: sortOrder };

      const result = await ExameService.getAllExams(filters, sort, page, limit);
      res.status(200).json(result);
    } catch (error) {
      console.error('Error in getAllExams controller:', error);
      res.status(500).json({ 
        message: "Failed to fetch exams",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },

  register: async (req: Request, res: Response) => {
    try {
      const examId = req.params.examId;
      const athleteId = req.user.id;

      const result = await ExameService.registerForExam(examId, athleteId);
      res.status(200).json(result);
    } catch (error) {
      console.error("Error in exam registration:", error);
      res.status(400).json({
        message: error instanceof Error ? error.message : "Failed to register for exam"
      });
    }
  },

  myExams: async (req: Request, res: Response) => {
    try {
      const athleteId = req.user.id;
      const exams = await ExameService.getAthleteExams(athleteId);
      res.status(200).json(exams);
    } catch (error) {
      console.error("Error fetching athlete exams:", error);
      res.status(500).json({
        message: "Failed to fetch exams"
      });
    }
  },

  updateResult: async (req: Request, res: Response) => {
    try {
      const { examId, athleteId, grade } = req.body;

      if (!examId || !athleteId || !grade) {
        return res.status(400).json({
          message: "Missing required fields: examId, athleteId, and grade"
        });
      }

      const result = await ExameService.updateExamResult(examId, athleteId, grade);
      res.status(200).json(result);
    } catch (error) {
      console.error("Error updating exam result:", error);
      res.status(400).json({
        message: error instanceof Error ? error.message : "Failed to update exam result"
      });
    }
  }
};
