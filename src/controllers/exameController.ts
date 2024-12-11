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
  }
};
