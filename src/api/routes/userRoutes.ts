import express from "express";
import { UserController } from "../../controllers/userController";
import { AuthController } from "../../controllers/authController";
import { verifyToken } from "../../middlewares/verifyToken";
import { authorizeRole } from "../../middlewares/authMiddleware";
import { roles } from "../../models/userModel";
import { upload } from "../../middlewares/uploadMiddleware";

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - name
 *         - email
 *         - password
 *         - role
 *       properties:
 *         name:
 *           type: string
 *         email:
 *           type: string
 *           format: email
 *         password:
 *           type: string
 *         role:
 *           type: string
 *           enum: [ATHLETE, INSTRUCTOR, ADMIN]
 *         belt:
 *           type: string
 *           enum: [WHITE, YELLOW, ORANGE, GREEN, BLUE, BROWN, BLACK]
 *         birthDate:
 *           type: string
 *           format: date
 *         phone:
 *           type: string
 */

/**
 * @swagger
 * /api/users/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Invalid input data
 */

/**
 * @swagger
 * /api/users/login:
 *   post:
 *     summary: Login user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */

/**
 * @swagger
 * /api/users/login-qr:
 *   post:
 *     summary: Login using QR code
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - qrCode
 *             properties:
 *               qrCode:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid QR code
 */

/**
 * @swagger
 * /api/users/password/change:
 *   post:
 *     summary: Change user password
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password changed successfully
 *       401:
 *         description: Invalid current password
 */

/**
 * @swagger
 * /api/users/password/forgot:
 *   post:
 *     summary: Request password reset
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Reset email sent successfully
 *       404:
 *         description: User not found
 */

/**
 * @swagger
 * /api/users/password/reset:
 *   post:
 *     summary: Reset password using token
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - newPassword
 *             properties:
 *               token:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password reset successful
 *       400:
 *         description: Invalid or expired token
 */

/**
 * @swagger
 * /api/users/me:
 *   get:
 *     summary: Get current user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 */

/**
 * @swagger
 * /api/users/update:
 *   put:
 *     summary: Update user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               phone:
 *                 type: string
 *               birthDate:
 *                 type: string
 *                 format: date
 *     responses:
 *       200:
 *         description: Profile updated successfully
 */

/**
 * @swagger
 * /api/users/avatar:
 *   post:
 *     summary: Upload user avatar
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               avatar:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Avatar uploaded successfully
 */

/**
 * @swagger
 * /api/users/athletes:
 *   get:
 *     summary: Get all athletes (Instructor only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of athletes
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 */

/**
 * @swagger
 * /api/users/athletes/{athleteId}/belt:
 *   put:
 *     summary: Update athlete belt (Instructor only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: athleteId
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
 *               - belt
 *             properties:
 *               belt:
 *                 type: string
 *                 enum: [WHITE, YELLOW, ORANGE, GREEN, BLUE, BROWN, BLACK]
 *     responses:
 *       200:
 *         description: Belt updated successfully
 *       404:
 *         description: Athlete not found
 */

// Authentication routes
router.post("/register", AuthController.register);
router.post("/login", AuthController.login);
router.post("/login-qr", AuthController.loginWithQR);

// Password management routes
router.post("/password/change", verifyToken, AuthController.changePassword);
router.post("/password/forgot", AuthController.forgotPassword);
router.post("/password/reset", AuthController.resetPassword);

// User data route
router.get("/me", verifyToken, UserController.me);
router.put("/update", verifyToken, UserController.updateProfile);  

// Avatar upload route
router.post("/avatar", verifyToken, upload.single('avatar'), UserController.uploadAvatar);

// Athlete management routes (instructors only)
router.get("/athletes", verifyToken, authorizeRole(roles.INSTRUCTOR), UserController.getAthletes);
router.put("/athletes/:athleteId/belt", verifyToken, authorizeRole(roles.INSTRUCTOR), UserController.updateAthleteBelt);

export default router;