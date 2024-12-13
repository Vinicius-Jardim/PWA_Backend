import { Request, Response } from "express";
import User, { roles, belts } from "../models/userModel";
import { AthleteService } from "../services/controller/atheleteService";

export const AthleteController = {
  // Listar atletas com paginação
  getAthletes: async (req: Request, res: Response) => {
    try {
      // Extrair dados de consulta (query params)
      const params = {
        search: (req.query.search as string) || "",
        page: parseInt(req.query.page as string) || 1,
        pageSize: parseInt(req.query.pageSize as string) || 10
      };

      // Buscar atletas
      const result = await AthleteService.getAthletes(params);

      // Enviar resposta
      res.status(200).json(result);
    } catch (error) {
      console.error("Erro ao buscar atletas:", error);
      res.status(500).json({
        message: "Erro ao buscar atletas",
        error: error instanceof Error ? error.message : error
      });
    }
  },

  // Atualizar faixa do atleta
  updateBelt: async (req: Request, res: Response) => {
    try {
      const { athleteId } = req.params;
      const { belt } = req.body;
      const instructorId = req.user.id;

      // Verificar se a faixa é válida
      if (!Object.values(belts).includes(belt)) {
        return res.status(400).json({
          message: "Faixa inválida. Faixas válidas: " + Object.values(belts).join(", ")
        });
      }

      // Atualizar a faixa do atleta
      const athlete = await User.findById(athleteId);
      if (!athlete || athlete.role !== roles.ATHLETE) {
        return res.status(404).json({
          message: "Atleta não encontrado"
        });
      }

      athlete.belt = belt;
      await athlete.save();

      res.status(200).json({
        message: "Faixa atualizada com sucesso",
        athlete: {
          id: athlete._id,
          name: athlete.name,
          belt: athlete.belt
        }
      });
    } catch (error) {
      console.error("Erro ao atualizar faixa:", error);
      res.status(500).json({
        message: "Erro ao atualizar faixa do atleta"
      });
    }
  }
};
