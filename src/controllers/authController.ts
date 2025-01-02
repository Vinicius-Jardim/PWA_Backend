import { Request, Response } from "express";
import { AuthService } from "../services/controller/authService";


export const AuthController = {

  // Register for athletes

  async register(req: Request, res: Response): Promise<void> {

    try {

      const { name, email, password, confirmPassword, instructorId } = req.body;

      const result = await AuthService.register(
        name,
        email,
        password,
        confirmPassword,
        instructorId
      );

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

      const { qrCode } = req.body;

      const result = await AuthService.loginWithQR(qrCode, res);

      res.status(200).json(result);

    } catch (error) {

      res.status(401).json({
        message: error instanceof Error ? error.message : "Error during QR code login",
      });

    }

  },

};
