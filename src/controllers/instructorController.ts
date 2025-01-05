import { Request, Response } from "express";
import { InstructorService } from "../services/controller/instructorService";

export const InstructorController = {
  // Lista todos os instrutores (rota protegida)
  all: async (req: Request, res: Response): Promise<void> => {
    try {
      const filters = {
        search: (req.query.search as string) || "",
      };
      const page = parseInt(req.query.page as string, 10) || 1;
      const pageSize = parseInt(req.query.pageSize as string, 10) || 10;

      const result = await InstructorService.all(filters, page, pageSize);
      res.status(200).json(result);
    } catch (error) {
      console.error("Error in getAll controller:", error);
      res.status(500).json({
        message: "Erro ao buscar instrutores",
        error: error instanceof Error ? error.message : String(error),
      });
    }
  },

  // Lista pública de instrutores (dados básicos)
  getPublicList: async (req: Request, res: Response): Promise<void> => {
    try {
      const page = parseInt(req.query.page as string, 10) || 1;
      const pageSize = parseInt(req.query.pageSize as string, 10) || 10;
      const result = await InstructorService.getPublicList(page, pageSize);
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({
        message: "Erro ao buscar lista de instrutores",
        error: error instanceof Error ? error.message : String(error),
      });
    }
  },

  // Criar novo instrutor (admin)
  create: async (req: Request, res: Response): Promise<void> => {
    try {
      const { name, email, password, credentialNumber } = req.body;
      const instructor = await InstructorService.createInstructor({
        name,
        email,
        password,
        credentialNumber,
      });
      res.status(201).json(instructor);
    } catch (error) {
      res.status(500).json({
        message: "Erro ao criar instrutor",
        error: error instanceof Error ? error.message : String(error),
      });
    }
  },

  // Atualizar credencial do instrutor (admin)
  updateCredential: async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { credentialNumber } = req.body;
      const instructor = await InstructorService.updateCredential(id, credentialNumber);
      res.status(200).json(instructor);
    } catch (error) {
      res.status(500).json({
        message: "Erro ao atualizar credencial",
        error: error instanceof Error ? error.message : String(error),
      });
    }
  },

  // Deletar instrutor (admin)
  delete: async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      await InstructorService.deleteInstructor(id);
      res.status(200).json({ message: "Instrutor removido com sucesso" });
    } catch (error) {
      res.status(500).json({
        message: "Erro ao deletar instrutor",
        error: error instanceof Error ? error.message : String(error),
      });
    }
  },
};
