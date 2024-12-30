import { Router } from "express";
import { MonthlyFeeController } from "../../controllers/monthlyFeeController";
import { verifyToken } from "../../middlewares/verifyToken";

const router = Router();

// Rotas protegidas por autenticação
router.use(verifyToken);

// Rota para buscar mensalidades do usuário logado
router.get("/my-fees", MonthlyFeeController.getMyFees);

// Rota para buscar todas as mensalidades (apenas instrutores)
router.get("/athletes", MonthlyFeeController.getAthletesFees);

// Rota para marcar mensalidade como paga (apenas instrutores)
router.put("/:id/mark-paid", MonthlyFeeController.markAsPaid);

export default router;
