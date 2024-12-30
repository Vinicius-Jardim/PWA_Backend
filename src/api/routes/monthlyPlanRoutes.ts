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

// Novas rotas
router.get('/current', verifyToken, authorizeRole(roles.ATHLETE), MonthlyPlanController.current);
router.get('/requests/:planId', verifyToken, authorizeRole(roles.INSTRUCTOR), MonthlyPlanController.getPlanRequests);
router.post('/accept-request/:feeId', verifyToken, authorizeRole(roles.INSTRUCTOR), MonthlyPlanController.acceptPlanRequest);

export default router;