import { ExameController } from "../../controllers/exameController";
import express from "express";
import { verifyToken } from "../../middlewares/verifyToken";
import { authorizeRole } from "../../middlewares/authMiddleware";
import { roles } from "../../models/userModel";

const router = express.Router();

router.post(
  "/create",
  verifyToken,
  authorizeRole(roles.INSTRUCTOR),
  ExameController.create
);
router.get(
  "/own",
  verifyToken,
  authorizeRole(roles.INSTRUCTOR),
  ExameController.own
);
router.get(
  "/all",
  verifyToken,
  authorizeRole(roles.ATHLETE),
  ExameController.all
);
router.post(
  "/register/:id",
  verifyToken,
  authorizeRole(roles.ATHLETE),
  ExameController.register
);
router.post(
  "/unregister/:id",
  verifyToken,
  authorizeRole(roles.ATHLETE),
  ExameController.unregister
);
router.get(
  "/my-exams",
  verifyToken,
  authorizeRole(roles.ATHLETE),
  ExameController.myExams
);
router.post(
  "/result",
  verifyToken,
  authorizeRole(roles.INSTRUCTOR),
  ExameController.updateResult
);

export default router;
