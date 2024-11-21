import express from "express";
import { InstructorCredentialController } from "../../controllers/instructorCredentialController";
import { authorizeRole } from "../../middlewares/authMiddleware";
import { verifyToken } from "../../middlewares/verifyToken";
import { roles } from "../../models/userModel";

const router = express.Router();

//=====================================INSTRUCTOR ROUTES========================================

router.get(
  "/get-by-id/:id",
  verifyToken,
  authorizeRole(roles.INSTRUCTOR),
  InstructorCredentialController.getById
);

//=====================================ADMIN ROUTES========================================

router.post(
  "/new-id",
  verifyToken,
  authorizeRole(roles.ADMIN),
  InstructorCredentialController.createInstructorCredential
);

router.get(
  "/get-all/",
  verifyToken,
  authorizeRole(roles.ADMIN),
  InstructorCredentialController.getAll
);

router.delete(
  "/delete-by-id/:id",
  verifyToken,
  authorizeRole(roles.ADMIN),
  InstructorCredentialController.deleteById
);

export default router;
