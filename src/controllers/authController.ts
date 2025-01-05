import { Request, Response } from "express";
import { AuthService } from "../services/controller/authService";

export const AuthController = {

  // Register for athletes

  async register(req: Request, res: Response): Promise<void> {

    try {

      const result = await AuthService.register(req.body);

      res.status(201).json(result);

    } catch (error) {

      res.status(400).json({
        message: error instanceof Error ? error.message : "Error registering user",
      });

    }

  },



  async login(req: Request, res: Response): Promise<void> {

    try {

      const { email, password } = req.body;

      const result = await AuthService.login(email, password, res);

      res.status(200).json(result);

    } catch (error) {

      res.status(401).json({
        message: error instanceof Error ? error.message : "Error during login",
      });

    }

  },



  async loginWithQR(req: Request, res: Response): Promise<void> {

    try {

      const { qrCodeData } = req.body;

      const result = await AuthService.loginWithQR(qrCodeData, res);

      res.status(200).json(result);

    } catch (error) {

      res.status(401).json({
        message: error instanceof Error ? error.message : "Error during QR login",
      });

    }

  },

  async changePassword(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const { oldPassword, newPassword } = req.body;

      if (!userId) {
        res.status(401).json({ message: "User not authenticated" });
        return;
      }

      await AuthService.changePassword(userId, oldPassword, newPassword);
      res.status(200).json({ message: "Password changed successfully" });
    } catch (error) {
      res.status(400).json({
        message: error instanceof Error ? error.message : "Error changing password",
      });
    }
  },

  async forgotPassword(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;
      await AuthService.forgotPassword(email);
      res.status(200).json({ message: "Password reset email sent" });
    } catch (error) {
      res.status(400).json({
        message: error instanceof Error ? error.message : "Error processing forgot password request",
      });
    }
  },

  async resetPassword(req: Request, res: Response): Promise<void> {
    try {
      const { token, newPassword } = req.body;
      await AuthService.resetPassword(token, newPassword);
      res.status(200).json({ message: "Password reset successfully" });
    } catch (error) {
      res.status(400).json({
        message: error instanceof Error ? error.message : "Error resetting password",
      });
    }
  },
};
