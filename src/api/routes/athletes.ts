import { Router } from 'express';
import { authorizeRole} from '../../middlewares/authMiddleware';
import { roles } from '../../models/userModel';
import { AthleteController } from '../../controllers/athleteController';
import { verifyToken } from '../../middlewares/verifyToken';
const router = Router();

router.get('/all', verifyToken, authorizeRole(roles.INSTRUCTOR), AthleteController.getAthletes);
router.put('/:athleteId/belt', verifyToken, authorizeRole(roles.INSTRUCTOR), AthleteController.updateBelt);

export default router;
