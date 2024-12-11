import { InstructorController } from "../../controllers/instructorController";
import express from "express";
import { verifyToken } from "../../middlewares/verifyToken";

const router = express.Router();

router.get("/all", verifyToken, InstructorController.all);

export default router;
