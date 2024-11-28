import { Router } from 'express';
import { authorizeRole} from '../../middlewares/authMiddleware';
import { roles } from '../../models/userModel';
import { AthleteController } from '../../controllers/athleteController';
import { verifyToken } from '../../middlewares/verifyToken';
const router = Router();

router.get('/all', verifyToken ,authorizeRole(roles.INSTRUCTOR), AthleteController.getAthletes);
/*
router.post('/', createAthlete);
router.put('/:id', updateAthlete);
router.delete('/:id', deleteAthlete);*/
//router.get('/by-id/:id', verifyToken, AthleteController.getAthleteById);

export default router;
