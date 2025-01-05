import { Router } from 'express';
import { MonthlyPlanController } from '../../controllers/monthlyPlanController';
import { verifyToken } from '../../middlewares/verifyToken';
import { authorizeRole } from '../../middlewares/authMiddleware';
import { roles } from '../../models/userModel';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     MonthlyPlan:
 *       type: object
 *       required:
 *         - name
 *         - price
 *         - duration
 *         - graduationScopes
 *         - weeklyClasses
 *       properties:
 *         name:
 *           type: string
 *           description: Nome do plano mensal
 *         price:
 *           type: number
 *           minimum: 0
 *           description: Preço do plano
 *         duration:
 *           type: number
 *           minimum: 1
 *           description: Duração em meses
 *         graduationScopes:
 *           type: array
 *           items:
 *             type: string
 *             enum: [international, national, regional]
 *           description: Escopo das graduações incluídas
 *         weeklyClasses:
 *           type: number
 *           minimum: 1
 *           description: Número de aulas semanais
 *         privateLessonsIncluded:
 *           type: boolean
 *           default: false
 *           description: Indica se inclui aulas particulares
 *         studentCapacity:
 *           type: number
 *           minimum: 1
 *           description: Capacidade máxima de alunos
 *         description:
 *           type: string
 *           maxLength: 500
 *           description: Descrição do plano
 */

/**
 * @swagger
 * tags:
 *   name: Monthly Plans
 *   description: Gerenciamento de planos mensais
 */

/**
 * @swagger
 * /api/monthly-plans/add:
 *   post:
 *     summary: Adiciona um novo plano mensal
 *     tags: [Monthly Plans]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MonthlyPlan'
 *     responses:
 *       201:
 *         description: Plano criado com sucesso
 *       403:
 *         description: Acesso negado - Apenas instrutores podem criar planos
 */
router.post('/add', verifyToken, authorizeRole(roles.INSTRUCTOR), MonthlyPlanController.add);

/**
 * @swagger
 * /api/monthly-plans/all:
 *   get:
 *     summary: Lista todos os planos mensais
 *     tags: [Monthly Plans]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de planos mensais
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/MonthlyPlan'
 */
router.get('/all', verifyToken, authorizeRole([roles.ATHLETE, roles.INSTRUCTOR]), MonthlyPlanController.all);

/**
 * @swagger
 * /api/monthly-plans/update/{id}:
 *   put:
 *     summary: Atualiza um plano mensal existente
 *     tags: [Monthly Plans]
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
 *             $ref: '#/components/schemas/MonthlyPlan'
 *     responses:
 *       200:
 *         description: Plano atualizado com sucesso
 *       403:
 *         description: Acesso negado - Apenas instrutores podem atualizar planos
 *       404:
 *         description: Plano não encontrado
 */
router.put('/update/:id', verifyToken, authorizeRole(roles.INSTRUCTOR), MonthlyPlanController.update);

/**
 * @swagger
 * /api/monthly-plans/choose/{id}:
 *   post:
 *     summary: Atleta escolhe um plano mensal
 *     tags: [Monthly Plans]
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
 *         description: Plano escolhido com sucesso
 *       403:
 *         description: Acesso negado - Apenas atletas podem escolher planos
 *       404:
 *         description: Plano não encontrado
 */
router.post('/choose/:id', verifyToken, authorizeRole(roles.ATHLETE), MonthlyPlanController.choosePlan);

/**
 * @swagger
 * /api/monthly-plans/current:
 *   get:
 *     summary: Obtém o plano atual do atleta
 *     tags: [Monthly Plans]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Plano atual do atleta
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MonthlyPlan'
 *       403:
 *         description: Acesso negado - Apenas atletas podem ver seu plano atual
 */
router.get('/current', verifyToken, authorizeRole(roles.ATHLETE), MonthlyPlanController.current);

/**
 * @swagger
 * /api/monthly-plans/requests/{planId}:
 *   get:
 *     summary: Lista solicitações para um plano específico
 *     tags: [Monthly Plans]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: planId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de solicitações do plano
 *       403:
 *         description: Acesso negado - Apenas instrutores podem ver solicitações
 */
router.get('/requests/:planId', verifyToken, authorizeRole(roles.INSTRUCTOR), MonthlyPlanController.getPlanRequests);

/**
 * @swagger
 * /api/monthly-plans/accept-request/{feeId}:
 *   post:
 *     summary: Aceita uma solicitação de plano
 *     tags: [Monthly Plans]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: feeId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Solicitação aceita com sucesso
 *       403:
 *         description: Acesso negado - Apenas instrutores podem aceitar solicitações
 *       404:
 *         description: Solicitação não encontrada
 */
router.post('/accept-request/:feeId', verifyToken, authorizeRole(roles.INSTRUCTOR), MonthlyPlanController.acceptPlanRequest);

/**
 * @swagger
 * /api/monthly-plans/delete/{id}:
 *   delete:
 *     summary: Remove um plano mensal
 *     tags: [Monthly Plans]
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
 *         description: Plano removido com sucesso
 *       403:
 *         description: Acesso negado - Apenas instrutores ou admin podem remover planos
 *       404:
 *         description: Plano não encontrado
 */
router.delete('/delete/:id', verifyToken, authorizeRole([roles.INSTRUCTOR, roles.ADMIN]), MonthlyPlanController.delete);

export default router;