import { Request, Response } from "express";
import { InstructorCredentialService } from "../services/controller/instructorCredentialService";

export const InstructorCredentialController = {
  createInstructorCredential: async (req: Request, res: Response) => {
    try {
      const result =
        await InstructorCredentialService.createInstructorCredential(
          req.body.instructorId
        );
      res.status(201).json(result);
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error creating instructor credential", error });
    }
  },

  getAll: async (req: Request, res: Response) => {
    try {
      // Extrair dados de consulta
      const filters = {
        search: (req.query.search as string) || "", // Termo de busca
        isUsed: req.query.isUsed === "true", // Filtro booleano
      };
      const page = parseInt(req.query.page as string, 10) || 1; // Página
      const pageSize = parseInt(req.query.pageSize as string, 10) || 10; // Tamanho da página

      // Chamar o serviço para obter os dados
      const result = await InstructorCredentialService.getAll(
        filters,
        page,
        pageSize
      );

      // Responder com os dados formatados
      res.status(200).json(result);
    } catch (error) {
      console.error("Error in getAll controller:", error);
      res.status(500).json({
        message: "Error fetching instructor credentials",
        error: error instanceof Error ? error.message : String(error),
      });
    }
  },

  getById: async (req: Request, res: Response) => {
    try {
      const result = await InstructorCredentialService.getById(
        req.params.id,
        req.roleUser,
        req.user
      );
      res.status(200).json(result);
    } catch (error) {
      console.error("Error in getById controller:", error);
      res.status(500).json({
        message: "Error fetching instructor credential",
        error: error instanceof Error ? error.message : String(error),
      });
    }
  },

  deleteById: async (req: Request, res: Response) => {
    try {
      const result = await InstructorCredentialService.deleteById(
        req.params.id
      );
      res.status(200).json(result);
    } catch (error) {
      console.error("Error in deleteById controller:", error);
      res.status(500).json({
        message: "Error deleting instructor credential",
        error: error instanceof Error ? error.message : String(error),
      });
    }
  },
};
