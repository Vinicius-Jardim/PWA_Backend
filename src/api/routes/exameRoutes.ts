import { Router } from "express";
import { ExameController } from "../../controllers/exameController";
import { verifyToken } from "../../middlewares/verifyToken";
import { authorizeRole } from "../../middlewares/authMiddleware";
import { roles } from "../../models/userModel";

const router = Router();

// Rotas públicas
router.get("/all", verifyToken, authorizeRole(roles.ATHLETE), ExameController.all);

// Rotas que requerem autenticação
router.post("/register/:id", verifyToken, authorizeRole(roles.ATHLETE), ExameController.register);
router.post("/unregister/:id", verifyToken, authorizeRole(roles.ATHLETE), ExameController.unregister);
router.get("/my-exams", verifyToken, authorizeRole(roles.ATHLETE), ExameController.myExams);

// Rotas que requerem ser instrutor
router.post("/create", verifyToken, authorizeRole(roles.INSTRUCTOR), ExameController.create);
router.get("/own", verifyToken, authorizeRole(roles.INSTRUCTOR), ExameController.own);
router.put("/:id", verifyToken, authorizeRole(roles.INSTRUCTOR), ExameController.update);
router.post("/result", verifyToken, authorizeRole(roles.INSTRUCTOR), ExameController.updateResult);
router.get("/:id/participants", verifyToken, authorizeRole(roles.INSTRUCTOR), ExameController.getParticipants);

export default router;
