import { Request, Response } from "express";
import { AuthService } from "../services/controller/authService";

export const AuthController = {
  register: async (req: Request, res: Response): Promise<void> => {
    try {
      // Chamando o serviço de autenticação diretamente com os valores
      const result = await AuthService.register(
        req.body.name,
        req.body.email,
        req.body.password,
        req.body.instructorId || "",
        req.body.confirmPassword
      );
      // Enviando a resposta
      res.status(201).json(result);
    } catch (error) {
      res.status(500).json({ message: "Error registering user", error });
    }
  },
  login: async (req: Request, res: Response) => {
    try {
      // Passando o `res` para o serviço de login
      const result = await AuthService.login(req.body.email, req.body.password, res);
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ message: "Error logging in", error });
    }
  },
};
