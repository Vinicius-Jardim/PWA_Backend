import { InstructorController } from "../../controllers/instructorController";
import express from "express";
import { verifyToken } from "../../middlewares/verifyToken";
import { authorizeRole } from "../../middlewares/authMiddleware";
import { roles } from "../../models/userModel";

const router = express.Router();

// Rotas públicas
router.get("/public", InstructorController.getPublicList);

// Rotas protegidas - apenas admin
router.get("/all", verifyToken, authorizeRole(roles.ADMIN), InstructorController.all);
router.post("/create", verifyToken, authorizeRole(roles.ADMIN), InstructorController.create);
router.put("/:id/credential", verifyToken, authorizeRole(roles.ADMIN), InstructorController.updateCredential);
router.delete("/:id", verifyToken, authorizeRole(roles.ADMIN), InstructorController.delete);

export default router;
