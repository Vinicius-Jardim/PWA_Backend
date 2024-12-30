import { Request, Response } from "express";
import { InstructorService } from "../services/controller/instructorService";

export const InstructorController = {
  // Rota protegida - retorna dados completos
  all: async (req: Request, res: Response): Promise<void> => {
    try {
      const filters = {
        search: (req.query.search as string) || "",
        isUsed: req.query.isUsed === "true",
      };
      const page = parseInt(req.query.page as string, 10) || 1;
      const pageSize = parseInt(req.query.pageSize as string, 10) || 10;

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

  // Nova rota pública - retorna apenas dados básicos
  getPublicList: async (req: Request, res: Response): Promise<void> => {
    try {
      const result = await InstructorService.getPublicList();
      res.status(200).json(result);
    } catch (error) {
      console.error("Error in getPublicList controller:", error);
      res.status(500).json({
        message: "Error fetching instructors list",
        error: error instanceof Error ? error.message : String(error),
      });
    }
  },

  joinInstrutor: async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const result = await InstructorService.joinInstructor(id, req.user.id);
      res.status(200).json(result);
    } catch (error) {
      console.error("Error in joinInstructor controller:", error);
      res.status(500).json({
        message: "Error joining instructor",
        error: error instanceof Error ? error.message : String(error),
      });
    }
  },
};
