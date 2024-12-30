import { InstructorController } from "../../controllers/instructorController";
import express from "express";
import { verifyToken } from "../../middlewares/verifyToken";

const router = express.Router();

router.get("/public", InstructorController.getPublicList); // Rota pública
router.get("/all", verifyToken, InstructorController.all); // Rota protegida
router.post("/add/:id", verifyToken, InstructorController.joinInstrutor);

export default router;
