import { Router } from 'express';
import { authorizeRole} from '../../middlewares/authMiddleware';
import { roles } from '../../models/userModel';
import { AthleteController } from '../../controllers/athleteController';
import { verifyToken } from '../../middlewares/verifyToken';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Athlete:
 *       type: object
 *       required:
 *         - name
 *         - email
 *         - belt
 *       properties:
 *         _id:
 *           type: string
 *           description: ID único do atleta
 *         name:
 *           type: string
 *           description: Nome completo do atleta
 *         email:
 *           type: string
 *           format: email
 *           description: Email do atleta
 *         belt:
 *           type: string
 *           enum: [WHITE, YELLOW, ORANGE, GREEN, BLUE, BROWN, BLACK]
 *           description: Faixa atual do atleta
 *         birthDate:
 *           type: string
 *           format: date
 *           description: Data de nascimento
 *         suspended:
 *           type: boolean
 *           description: Status de suspensão do atleta
 *         instructorId:
 *           type: string
 *           description: ID do instrutor responsável
 *         monthlyFee:
 *           type: number
 *           description: Valor da mensalidade
 */

/**
 * @swagger
 * tags:
 *   name: Athletes
 *   description: Gerenciamento de atletas
 */

/**
 * @swagger
 * /api/athletes/all:
 *   get:
 *     summary: Lista todos os atletas (Instrutor)
 *     tags: [Athletes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de atletas
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Athlete'
 *       403:
 *         description: Acesso negado - Apenas instrutores podem ver lista de atletas
 */
router.get('/all', verifyToken, authorizeRole(roles.INSTRUCTOR), AthleteController.getAthletes);

/**
 * @swagger
 * /api/athletes/all-with-fees:
 *   get:
 *     summary: Lista todos os atletas com informações de mensalidades (Instrutor)
 *     tags: [Athletes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de atletas com mensalidades
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 allOf:
 *                   - $ref: '#/components/schemas/Athlete'
 *                   - type: object
 *                     properties:
 *                       fees:
 *                         type: array
 *                         items:
 *                           $ref: '#/components/schemas/MonthlyFee'
 *       403:
 *         description: Acesso negado - Apenas instrutores podem ver esta informação
 */
router.get('/all-with-fees', verifyToken, authorizeRole(roles.INSTRUCTOR), AthleteController.getAthletesWithFees);

/**
 * @swagger
 * /api/athletes/{athleteId}/belt:
 *   put:
 *     summary: Atualiza a faixa do atleta (Instrutor)
 *     tags: [Athletes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: athleteId
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
 *               - belt
 *             properties:
 *               belt:
 *                 type: string
 *                 enum: [WHITE, YELLOW, ORANGE, GREEN, BLUE, BROWN, BLACK]
 *     responses:
 *       200:
 *         description: Faixa atualizada com sucesso
 *       403:
 *         description: Acesso negado - Apenas instrutores podem atualizar faixas
 *       404:
 *         description: Atleta não encontrado
 */
router.put('/:athleteId/belt', verifyToken, authorizeRole(roles.INSTRUCTOR), AthleteController.updateBelt);

/**
 * @swagger
 * /api/athletes/{athleteId}/suspend:
 *   put:
 *     summary: Suspende ou reativa um atleta (Instrutor)
 *     tags: [Athletes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: athleteId
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
 *               - suspended
 *             properties:
 *               suspended:
 *                 type: boolean
 *               reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: Status de suspensão atualizado com sucesso
 *       403:
 *         description: Acesso negado - Apenas instrutores podem suspender atletas
 *       404:
 *         description: Atleta não encontrado
 */
router.put('/:athleteId/suspend', verifyToken, authorizeRole(roles.INSTRUCTOR), AthleteController.suspendAthlete);

/**
 * @swagger
 * /api/athletes/{athleteId}/send-payment-reminder:
 *   post:
 *     summary: Envia lembrete de pagamento para o atleta (Instrutor)
 *     tags: [Athletes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: athleteId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lembrete enviado com sucesso
 *       403:
 *         description: Acesso negado - Apenas instrutores podem enviar lembretes
 *       404:
 *         description: Atleta não encontrado
 */
router.post('/:athleteId/send-payment-reminder', verifyToken, authorizeRole(roles.INSTRUCTOR), AthleteController.sendPaymentReminder);

/**
 * @swagger
 * /api/athletes/{athleteId}:
 *   delete:
 *     summary: Remove um atleta (Instrutor)
 *     tags: [Athletes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: athleteId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Atleta removido com sucesso
 *       403:
 *         description: Acesso negado - Apenas instrutores podem remover atletas
 *       404:
 *         description: Atleta não encontrado
 */
router.delete('/:athleteId', verifyToken, authorizeRole(roles.INSTRUCTOR), AthleteController.deleteAthlete);

export default router;
