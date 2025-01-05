import { Router } from "express";
import { MonthlyFeeController } from "../../controllers/monthlyFeeController";
import { authorizeRole } from "../../middlewares/authMiddleware";

const router = Router();

router.use(authorizeRole(['ATHLETE', 'INSTRUCTOR']));
/**
 * @swagger
 * components:
 *   schemas:
 *     MonthlyFee:
 *       type: object
 *       required:
 *         - userId
 *         - planId
 *         - amount
 *         - dueDate
 *       properties:
 *         userId:
 *           type: string
 *           description: ID do usuário
 *         planId:
 *           type: string
 *           description: ID do plano mensal
 *         amount:
 *           type: number
 *           minimum: 0
 *           description: Valor da mensalidade
 *         dueDate:
 *           type: string
 *           format: date
 *           description: Data de vencimento
 *         paidAt:
 *           type: string
 *           format: date
 *           description: Data do pagamento
 *         status:
 *           type: string
 *           enum: [pending, paid, late]
 *           description: Status do pagamento
 *         paymentMethod:
 *           type: string
 *           enum: [cash, card, transfer]
 *           description: Método de pagamento
 *         transactionId:
 *           type: string
 *           description: ID da transação
 *         notes:
 *           type: string
 *           description: Observações
 */

/**
 * @swagger
 * tags:
 *   name: Monthly Fees
 *   description: Gerenciamento de mensalidades
 */

/**
 * @swagger
 * /api/monthly-fees/my-fees:
 *   get:
 *     summary: Obtém as mensalidades do usuário logado
 *     tags: [Monthly Fees]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de mensalidades do usuário
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/MonthlyFee'
 *       403:
 *         description: Acesso negado
 */
router.get("/my-fees", MonthlyFeeController.getMyFees);

/**
 * @swagger
 * /api/monthly-fees/payment-history:
 *   get:
 *     summary: Obtém o histórico de pagamentos do usuário
 *     tags: [Monthly Fees]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Histórico de pagamentos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   paidAt:
 *                     type: string
 *                     format: date
 *                   amount:
 *                     type: number
 *                   monthlyFeeId:
 *                     type: string
 *       403:
 *         description: Acesso negado
 */
router.get("/payment-history", MonthlyFeeController.getPaymentHistory);

/**
 * @swagger
 * /api/monthly-fees/athletes-fees:
 *   get:
 *     summary: Obtém as mensalidades de todos os atletas (Instrutor)
 *     tags: [Monthly Fees]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de mensalidades dos atletas
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/MonthlyFee'
 *       403:
 *         description: Acesso negado - Apenas instrutores podem ver mensalidades dos atletas
 */
router.get("/athletes-fees", authorizeRole('INSTRUCTOR'), MonthlyFeeController.getAthletesFees);

/**
 * @swagger
 * /api/monthly-fees/{id}/mark-paid:
 *   put:
 *     summary: Marca uma mensalidade como paga (Instrutor)
 *     tags: [Monthly Fees]
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
 *               - paymentMethod
 *             properties:
 *               paymentMethod:
 *                 type: string
 *                 enum: [cash, card, transfer]
 *               transactionId:
 *                 type: string
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Mensalidade marcada como paga
 *       403:
 *         description: Acesso negado - Apenas instrutores podem marcar pagamentos
 *       404:
 *         description: Mensalidade não encontrada
 */
router.put("/:id/mark-paid", authorizeRole('INSTRUCTOR'), MonthlyFeeController.markAsPaid);

export default router;
