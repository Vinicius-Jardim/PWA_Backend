import { Router } from 'express';
import {
  getAthletes,createAthlete, updateAthlete, deleteAthlete, getAthleteById,} from '../controllers/athleteController';

const router = Router();

router.get('/', getAthletes);
router.post('/', createAthlete);
router.put('/:id', updateAthlete);
router.delete('/:id', deleteAthlete);
router.get('/:id', getAthleteById);

export default router;
