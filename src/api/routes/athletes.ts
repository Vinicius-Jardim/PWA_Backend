import { Router } from 'express';
import { authorizeRole} from '../../middlewares/authMiddleware';
import { roleHierarchy, roles } from '../../models/userModel';
import { AthleteController } from '../../controllers/athleteController';
const router = Router();

router.get('/all', authorizeRole(roles.INSTRUCTOR),AthleteController.getAthletes);
/*
router.post('/', createAthlete);
router.put('/:id', updateAthlete);
router.delete('/:id', deleteAthlete);
router.get('/:id', getAthleteById);*/

export default router;
