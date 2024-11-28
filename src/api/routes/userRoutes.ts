import express from 'express';
import { AuthController } from '../../controllers/authController';
import { verifyToken } from '../../middlewares/verifyToken';
import { UserController } from '../../controllers/userController';

const router = express.Router();

router.post('/register', AuthController.register);
router.post('/login', AuthController.login);
router.get('/me', verifyToken, UserController.me);

export default router;