import { Router } from 'express';
import { MonthlyPlanController } from '../../controllers/monthlyPlanController';
import { verifyToken } from '../../middlewares/verifyToken';
import { authorizeRole } from '../../middlewares/authMiddleware';
import { roles } from '../../models/userModel';

const router = Router();

router.post('/add', verifyToken, authorizeRole(roles.INSTRUCTOR), MonthlyPlanController.add);
router.get('/all', verifyToken, authorizeRole([roles.ATHLETE, roles.INSTRUCTOR]), MonthlyPlanController.all);
router.put('/update/:id', verifyToken, authorizeRole(roles.INSTRUCTOR), MonthlyPlanController.update);
router.post('/choose/:id', verifyToken, authorizeRole(roles.ATHLETE), MonthlyPlanController.choosePlan);

export default router;