import { Request, Response } from "express";
import { ExameService } from "../services/controller/exameService";

export const ExameController = {
  create: async (req: any, res: any) => {
    try {
      const result = await ExameService.create(req.body);
      return res.status(201).json({ message: "Exam created" });
    } catch (error) {
      console.error("Error during exam creation:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  },
};
