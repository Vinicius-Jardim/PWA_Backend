import { Router } from "express";
import { MonthlyFeeController } from "../../controllers/monthlyFeeController";
import { verifyToken } from "../../middlewares/verifyToken";

const router = Router();

router.post("/choose-plan/:planId", verifyToken ,MonthlyFeeController.createMonthlyFee);
router.put("/mark-as-paid/:monthlyFeeId", verifyToken ,MonthlyFeeController.markAsPaid);
router.get("/own", verifyToken ,MonthlyFeeController.getOwnMonthlyFees);
/*
router.get("/all", MonthlyFeeController.all);
router.post("/add", MonthlyFeeController.add);
router.put("/update/:id", MonthlyFeeController.update);
router.delete("/delete/:id", MonthlyFeeController.delete);*/

export default router;
