import { Router } from 'express';
import { authorizeRole} from '../../middlewares/authMiddleware';
import { roles } from '../../models/userModel';
import { AthleteController } from '../../controllers/athleteController';
import { verifyToken } from '../../middlewares/verifyToken';

const router = Router();

router.get('/all', verifyToken, authorizeRole(roles.INSTRUCTOR), AthleteController.getAthletes);
router.get('/all-with-fees', verifyToken, authorizeRole(roles.INSTRUCTOR), AthleteController.getAthletesWithFees);
router.put('/:athleteId/belt', verifyToken, authorizeRole(roles.INSTRUCTOR), AthleteController.updateBelt);
router.put('/:athleteId/suspend', verifyToken, authorizeRole(roles.INSTRUCTOR), AthleteController.suspendAthlete);
router.post('/:athleteId/send-payment-reminder', verifyToken, authorizeRole(roles.INSTRUCTOR), AthleteController.sendPaymentReminder);
router.delete('/:athleteId', verifyToken, authorizeRole(roles.INSTRUCTOR), AthleteController.deleteAthlete);

export default router;
