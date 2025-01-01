import express from "express";
import { UserController } from "../../controllers/userController";
import { AuthController } from "../../controllers/authController";
import { verifyToken } from "../../middlewares/verifyToken";
import { authorizeRole } from "../../middlewares/authMiddleware";
import { roles } from "../../models/userModel";
import { upload } from "../../middlewares/uploadMiddleware";

const router = express.Router();

// Authentication routes
router.post("/register", AuthController.register);
router.post("/login", AuthController.login);
router.post("/login-qr", AuthController.loginWithQR);

// User data route
router.get("/me", verifyToken, UserController.me);

// Avatar upload route
router.post("/avatar", verifyToken, upload.single('avatar'), UserController.uploadAvatar);

// Athlete management routes (instructors only)
router.get("/athletes", verifyToken, authorizeRole(roles.INSTRUCTOR), UserController.getAthletes);
router.put("/athletes/:athleteId/belt", verifyToken, authorizeRole(roles.INSTRUCTOR), UserController.updateAthleteBelt);

export default router;