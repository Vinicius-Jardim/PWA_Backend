import express from "express";
import { UserController } from "../../controllers/userController";
import { AuthController } from "../../controllers/authController";
import { verifyToken } from "../../middlewares/verifyToken";
import { authorizeRole } from "../../middlewares/authMiddleware";
import { roles } from "../../models/userModel";

const router = express.Router();

// Rotas de autenticação
router.post("/register", AuthController.register);
router.post("/login", AuthController.login);
router.post("/login-qr", AuthController.loginWithQR);

// Rota para obter dados do usuário logado
router.get("/me", verifyToken, UserController.me);

// Rotas para gerenciamento de atletas (apenas para instrutores)
router.get("/athletes", verifyToken, authorizeRole(roles.INSTRUCTOR), UserController.getAthletes);
router.put("/athletes/:athleteId/belt", verifyToken, authorizeRole(roles.INSTRUCTOR), UserController.updateAthleteBelt);

export default router;