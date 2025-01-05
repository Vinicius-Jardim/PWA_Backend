import { Router } from "express";
import { ExameController } from "../../controllers/exameController";
import { verifyToken } from "../../middlewares/verifyToken";
import { authorizeRole } from "../../middlewares/authMiddleware";
import { roles } from "../../models/userModel";

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     ExamSession:
 *       type: object
 *       required:
 *         - date
 *         - time
 *         - location
 *       properties:
 *         date:
 *           type: string
 *           format: date
 *         time:
 *           type: string
 *         location:
 *           type: string
 *         maxParticipants:
 *           type: number
 *           default: 10
 *     ExamResult:
 *       type: object
 *       required:
 *         - athleteId
 *         - grade
 *       properties:
 *         athleteId:
 *           type: string
 *         grade:
 *           type: number
 *           minimum: 0
 *           maximum: 10
 *         observations:
 *           type: string
 *     Exam:
 *       type: object
 *       required:
 *         - name
 *         - beltLevel
 *         - finalBelt
 *       properties:
 *         name:
 *           type: string
 *         beltLevel:
 *           type: array
 *           items:
 *             type: string
 *             enum: [WHITE, YELLOW, ORANGE, GREEN, BLUE, BROWN, BLACK]
 *         finalBelt:
 *           type: string
 *           enum: [YELLOW, ORANGE, GREEN, BLUE, BROWN, BLACK]
 *         description:
 *           type: string
 */

/**
 * @swagger
 * tags:
 *   name: Exams
 *   description: Gerenciamento de exames de faixa
 */

/**
 * @swagger
 * /api/exams/all:
 *   get:
 *     summary: Lista todos os exames
 *     tags: [Exams]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de exames
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Exam'
 */
router.get("/all", verifyToken, ExameController.all);

/**
 * @swagger
 * /api/exams/register/{sessionId}:
 *   post:
 *     summary: Registra um atleta em uma sessão de exame
 *     tags: [Exams]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Registro realizado com sucesso
 *       400:
 *         description: Sessão lotada ou atleta já registrado
 */
router.post("/register/:sessionId", verifyToken, authorizeRole(roles.ATHLETE), ExameController.register);

/**
 * @swagger
 * /api/exams/unregister/{sessionId}:
 *   post:
 *     summary: Cancela o registro de um atleta em uma sessão
 *     tags: [Exams]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Registro cancelado com sucesso
 */
router.post("/unregister/:sessionId", verifyToken, authorizeRole(roles.ATHLETE), ExameController.unregister);

/**
 * @swagger
 * /api/exams/my-exams:
 *   get:
 *     summary: Lista os exames do atleta logado
 *     tags: [Exams]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de exames do atleta
 */
router.get("/my-exams", verifyToken, authorizeRole(roles.ATHLETE), ExameController.myExams);

/**
 * @swagger
 * /api/exams/create:
 *   post:
 *     summary: Cria um novo exame (Instrutor)
 *     tags: [Exams]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Exam'
 *     responses:
 *       201:
 *         description: Exame criado com sucesso
 */
router.post("/create", verifyToken, authorizeRole(roles.INSTRUCTOR), ExameController.create);

/**
 * @swagger
 * /api/exams/own:
 *   get:
 *     summary: Lista exames criados pelo instrutor
 *     tags: [Exams]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de exames do instrutor
 */
router.get("/own", verifyToken, authorizeRole(roles.INSTRUCTOR), ExameController.own);

/**
 * @swagger
 * /api/exams/{id}:
 *   put:
 *     summary: Atualiza um exame existente
 *     tags: [Exams]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Exam'
 *     responses:
 *       200:
 *         description: Exame atualizado com sucesso
 */
router.put("/:id", verifyToken, authorizeRole(roles.INSTRUCTOR), ExameController.update);

/**
 * @swagger
 * /api/exams/{id}:
 *   delete:
 *     summary: Remove um exame
 *     tags: [Exams]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Exame removido com sucesso
 */
router.delete("/:id", verifyToken, authorizeRole(roles.INSTRUCTOR), ExameController.delete);

/**
 * @swagger
 * /api/exams/{examId}/sessions:
 *   get:
 *     summary: Lista sessões de um exame
 *     tags: [Exams]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: examId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de sessões
 */
router.get("/:examId/sessions", verifyToken, ExameController.getSessions);

/**
 * @swagger
 * /api/exams/{examId}/sessions:
 *   post:
 *     summary: Adiciona nova sessão ao exame
 *     tags: [Exams]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: examId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ExamSession'
 *     responses:
 *       201:
 *         description: Sessão criada com sucesso
 */
router.post("/:examId/sessions", verifyToken, authorizeRole(roles.INSTRUCTOR), ExameController.addSession);

/**
 * @swagger
 * /api/exams/{examId}/sessions/{sessionId}:
 *   put:
 *     summary: Atualiza uma sessão de exame
 *     tags: [Exams]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: examId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ExamSession'
 *     responses:
 *       200:
 *         description: Sessão atualizada com sucesso
 */
router.put("/:examId/sessions/:sessionId", verifyToken, authorizeRole(roles.INSTRUCTOR), ExameController.updateSession);

/**
 * @swagger
 * /api/exams/{examId}/sessions/{sessionId}:
 *   delete:
 *     summary: Remove uma sessão de exame
 *     tags: [Exams]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: examId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Sessão removida com sucesso
 */
router.delete("/:examId/sessions/:sessionId", verifyToken, authorizeRole(roles.INSTRUCTOR), ExameController.deleteSession);

/**
 * @swagger
 * /api/exams/result:
 *   post:
 *     summary: Atualiza resultado de exame
 *     tags: [Exams]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ExamResult'
 *     responses:
 *       200:
 *         description: Resultado atualizado com sucesso
 */
router.post("/result", verifyToken, authorizeRole(roles.INSTRUCTOR), ExameController.updateResult);

/**
 * @swagger
 * /api/exams/{id}/participants:
 *   get:
 *     summary: Lista participantes de um exame
 *     tags: [Exams]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de participantes
 */
router.get("/:id/participants", verifyToken, authorizeRole(roles.INSTRUCTOR), ExameController.getParticipants);

/**
 * @swagger
 * /api/exams/{examId}/updateBelt/{athleteId}:
 *   post:
 *     summary: Atualiza faixa do atleta após exame
 *     tags: [Exams]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: examId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: athleteId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Faixa atualizada com sucesso
 */
router.post("/:examId/updateBelt/:athleteId", verifyToken, authorizeRole(roles.INSTRUCTOR), ExameController.updateBelt);

export default router;
