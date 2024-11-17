import { Request, Response } from 'express';
import Athlete from '../models/Athlete';

// Listar atletas com paginação
export const getAthletes = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 10;
    const result = await paginate(Athlete, {}, page, pageSize);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching athletes', error });
  }
};

// Criar novo atleta
export const createAthlete = async (req: Request, res: Response): Promise<void> => {
  try {
    const athlete = new Athlete(req.body);
    const savedAthlete = await athlete.save();
    res.status(201).json(savedAthlete);
  } catch (error) {
    res.status(400).json({ message: 'Error creating athlete', error });
  }
};

// Atualizar atleta por ID
export const updateAthlete = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updatedAthlete = await Athlete.findByIdAndUpdate(id, req.body, { new: true });
    if (!updatedAthlete) {
      res.status(404).json({ message: 'Athlete not found' });
      return;
    }
    res.status(200).json(updatedAthlete);
  } catch (error) {
    res.status(400).json({ message: 'Error updating athlete', error });
  }
};

// Excluir atleta por ID
export const deleteAthlete = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const deletedAthlete = await Athlete.findByIdAndDelete(id);
    if (!deletedAthlete) {
      res.status(404).json({ message: 'Athlete not found' });
      return;
    }
    res.status(200).json({ message: 'Athlete deleted successfully' });
  } catch (error) {
    res.status(400).json({ message: 'Error deleting athlete', error });
  }
};

// Obter detalhes de um atleta por ID
export const getAthleteById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const athlete = await Athlete.findById(id);
    if (!athlete) {
      res.status(404).json({ message: 'Athlete not found' });
      return;
    }
    res.status(200).json(athlete);
  } catch (error) {
    res.status(400).json({ message: 'Error fetching athlete details', error });
  }
};
