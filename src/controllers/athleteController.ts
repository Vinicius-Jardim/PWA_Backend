import { Request, Response } from "express";
import User from "../models/userModel";
import { AthleteService } from "../services/controller/atheleteService";

export const AthleteController = {
  // Listar atletas com paginação
  getAthletes: async (req: Request, res: Response) => {
    try {
      // Extrair dados de consulta (query params)
      const data = {
        search: (req.query.search as string) || "", // Se houver um termo de pesquisa
        page: parseInt(req.query.page as string) || 1, // Página (default: 1)
        pageSize: parseInt(req.query.pageSize as string) || 10, // Tamanho da página (default: 10)
      };

      // Chamar o serviço com os dados extraídos
      const result = await AthleteService.getAthletes(data);

      // Enviar os resultados de volta para o cliente
      res.status(200).json({
        athletes: result.athletes,
        totalCount: result.totalCount,
        totalPages: result.totalPages,
        currentPage: result.currentPage,
      });
    } catch (error) {
      // Caso haja algum erro, retornar uma mensagem de erro
      res.status(500).json({
        message: "Error fetching athletes",
        error: error instanceof Error ? error.message : error,
      });
    }
  },
  /* Não implementado
  // Excluir atleta por ID
  deleteAthlete: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const deletedAthlete = await User.findByIdAndDelete(id);
      if (!deletedAthlete) {
        res.status(404).json({ message: "Athlete not found" });
        return;
      }
      res.status(200).json({ message: "Athlete deleted successfully" });
    } catch (error) {
      res.status(400).json({ message: "Error deleting athlete", error });
    }
  },

  // Obter detalhes de um atleta por ID
  getAthleteById: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const athlete = await User.findById(id);
      if (!athlete) {
        res.status(404).json({ message: "Athlete not found" });
        return;
      }
      res.status(200).json(athlete);
    } catch (error) {
      res
        .status(400)
        .json({ message: "Error fetching athlete details", error });
    }
  },*/
};
