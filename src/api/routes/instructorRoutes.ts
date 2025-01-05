import { InstructorController } from "../../controllers/instructorController";
import express from "express";
import { verifyToken } from "../../middlewares/verifyToken";
import { authorizeRole } from "../../middlewares/authMiddleware";
import { roles } from "../../models/userModel";

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Instructor:
 *       type: object
 *       required:
 *         - name
 *         - email
 *         - credentialNumber
 *       properties:
 *         _id:
 *           type: string
 *           description: ID único do instrutor
 *         name:
 *           type: string
 *           description: Nome completo do instrutor
 *         email:
 *           type: string
 *           format: email
 *           description: Email do instrutor
 *         credentialNumber:
 *           type: string
 *           pattern: '^\d{9}$'
 *           description: Número da credencial com 9 dígitos
 *         role:
 *           type: string
 *           enum: [INSTRUCTOR]
 *           description: Papel do usuário (sempre INSTRUCTOR)
 *         athletes:
 *           type: array
 *           items:
 *             type: string
 *           description: Lista de IDs dos atletas associados
 *         avatarUrl:
 *           type: string
 *           description: URL da foto do instrutor
 */

/**
 * @swagger
 * tags:
 *   name: Instructors
 *   description: Gerenciamento de instrutores
 */

/**
 * @swagger
 * /api/instructors/public:
 *   get:
 *     summary: Lista pública de instrutores
 *     tags: [Instructors]
 *     responses:
 *       200:
 *         description: Lista de instrutores com informações públicas
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   name:
 *                     type: string
 *                   credentialNumber:
 *                     type: string
 *                   avatarUrl:
 *                     type: string
 */
router.get("/public", InstructorController.getPublicList);

/**
 * @swagger
 * /api/instructors/all:
 *   get:
 *     summary: Lista todos os instrutores (Admin)
 *     tags: [Instructors]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista completa de instrutores
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Instructor'
 *       403:
 *         description: Acesso negado - Apenas administradores podem ver lista completa
 */
router.get("/all", verifyToken, authorizeRole(roles.ADMIN), InstructorController.all);

/**
 * @swagger
 * /api/instructors/create:
 *   post:
 *     summary: Cria um novo instrutor (Admin)
 *     tags: [Instructors]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *               - credentialNumber
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *               credentialNumber:
 *                 type: string
 *                 pattern: '^\d{9}$'
 *     responses:
 *       201:
 *         description: Instrutor criado com sucesso
 *       400:
 *         description: Dados inválidos
 *       403:
 *         description: Acesso negado - Apenas administradores podem criar instrutores
 */
router.post("/create", verifyToken, authorizeRole(roles.ADMIN), InstructorController.create);

/**
 * @swagger
 * /api/instructors/{id}/credential:
 *   put:
 *     summary: Atualiza credencial do instrutor (Admin)
 *     tags: [Instructors]
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
 *             type: object
 *             required:
 *               - credentialNumber
 *             properties:
 *               credentialNumber:
 *                 type: string
 *                 pattern: '^\d{9}$'
 *     responses:
 *       200:
 *         description: Credencial atualizada com sucesso
 *       400:
 *         description: Número de credencial inválido
 *       403:
 *         description: Acesso negado - Apenas administradores podem atualizar credenciais
 *       404:
 *         description: Instrutor não encontrado
 */
router.put("/:id/credential", verifyToken, authorizeRole(roles.ADMIN), InstructorController.updateCredential);

/**
 * @swagger
 * /api/instructors/{id}:
 *   delete:
 *     summary: Remove um instrutor (Admin)
 *     tags: [Instructors]
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
 *         description: Instrutor removido com sucesso
 *       403:
 *         description: Acesso negado - Apenas administradores podem remover instrutores
 *       404:
 *         description: Instrutor não encontrado
 */
router.delete("/:id", verifyToken, authorizeRole(roles.ADMIN), InstructorController.delete);

export default router;
