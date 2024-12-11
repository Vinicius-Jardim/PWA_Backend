import { ExameController } from "../../controllers/exameController";
import express from "express";
import { verifyToken } from "../../middlewares/verifyToken";

const router = express.Router();

router.post("/create", verifyToken, ExameController.create);

export default router;
