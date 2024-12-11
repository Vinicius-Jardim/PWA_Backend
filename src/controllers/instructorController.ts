import { Request, Response } from "express";
import { InstructorService } from "../services/controller/instructorService";

export const InstructorController = {
  all: async (req: Request, res: Response): Promise<void> => {
    try {
      // Extrair dados de consulta
      const filters = {
        search: (req.query.search as string) || "", // Termo de busca
        isUsed: req.query.isUsed === "true", // Filtro booleano
      };
      const page = parseInt(req.query.page as string, 10) || 1; // Página
      const pageSize = parseInt(req.query.pageSize as string, 10) || 10; // Tamanho da página

      const result = await InstructorService.all(filters, page, pageSize);
      res.status(200).json(result);
    } catch (error) {
      console.error("Error in getAll controller:", error);
      res.status(500).json({
        message: "Error fetching instructor credentials",
        error: error instanceof Error ? error.message : String(error),
      });
    }
  },
};
