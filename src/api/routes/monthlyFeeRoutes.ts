import { Router } from "express";
import { MonthlyFeeController } from "../../controllers/monthlyFeeController";
import { authorizeRole } from "../../middlewares/authMiddleware";

const router = Router();

// Rotas protegidas por autenticação - requer qualquer papel
router.use(authorizeRole(['ATHLETE', 'INSTRUCTOR']));

// Rota para obter as mensalidades do usuário logado
router.get("/my-fees", MonthlyFeeController.getMyFees);

// Rota para obter o histórico de pagamentos do usuário logado
router.get("/payment-history", MonthlyFeeController.getPaymentHistory);

// Rotas exclusivas para instrutores
router.get("/athletes-fees", authorizeRole('INSTRUCTOR'), MonthlyFeeController.getAthletesFees);
router.put("/:id/mark-paid", authorizeRole('INSTRUCTOR'), MonthlyFeeController.markAsPaid);

export default router;
