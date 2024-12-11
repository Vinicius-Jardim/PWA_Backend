import { ExameController } from "../../controllers/exameController";
import express from "express";
import { verifyToken } from "../../middlewares/verifyToken";
import { authorizeRole } from "../../middlewares/authMiddleware";
import { roles } from "../../models/userModel";

const router = express.Router();

router.post("/create", verifyToken, authorizeRole(roles.INSTRUCTOR),ExameController.create);
router.get("/own", verifyToken,authorizeRole(roles.INSTRUCTOR), ExameController.own);

export default router;
