import { Router } from "express";
import { ExameController } from "../../controllers/exameController";
import { verifyToken } from "../../middlewares/verifyToken";
import { authorizeRole } from "../../middlewares/authMiddleware";
import { roles } from "../../models/userModel";

const router = Router();

// Rotas públicas
router.get("/all", verifyToken, ExameController.all);

// Rotas que requerem autenticação e role específico
router.post("/register/:sessionId", verifyToken, authorizeRole(roles.ATHLETE), ExameController.register);
router.post("/unregister/:sessionId", verifyToken, authorizeRole(roles.ATHLETE), ExameController.unregister);
router.get("/my-exams", verifyToken, authorizeRole(roles.ATHLETE), ExameController.myExams);

// Rotas que requerem ser instrutor
router.post("/create", verifyToken, authorizeRole(roles.INSTRUCTOR), ExameController.create);
router.get("/own", verifyToken, authorizeRole(roles.INSTRUCTOR), ExameController.own);
router.put("/:id", verifyToken, authorizeRole(roles.INSTRUCTOR), ExameController.update);
router.delete("/:id", verifyToken, authorizeRole(roles.INSTRUCTOR), ExameController.delete);

// Rotas de sessão
router.get("/:examId/sessions", verifyToken, ExameController.getSessions);
router.post("/:examId/sessions", verifyToken, authorizeRole(roles.INSTRUCTOR), ExameController.addSession);
router.put("/:examId/sessions/:sessionId", verifyToken, authorizeRole(roles.INSTRUCTOR), ExameController.updateSession);
router.delete("/:examId/sessions/:sessionId", verifyToken, authorizeRole(roles.INSTRUCTOR), ExameController.deleteSession);

// Rotas de resultados
router.post("/result", verifyToken, authorizeRole(roles.INSTRUCTOR), ExameController.updateResult);
router.get("/:id/participants", verifyToken, authorizeRole(roles.INSTRUCTOR), ExameController.getParticipants);
router.post("/:examId/updateBelt/:athleteId", verifyToken, authorizeRole(roles.INSTRUCTOR), ExameController.updateBelt);

export default router;
