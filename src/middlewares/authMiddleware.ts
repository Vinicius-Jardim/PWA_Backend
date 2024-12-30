import { Request, Response, NextFunction } from 'express';
import {config} from '../config'; // Importa a chave secreta do JWT
import jwt, { JwtPayload } from 'jsonwebtoken';
import { roles, roleHierarchy } from '../models/userModel'; // Importa os roles e roleHierarchy

// Interface para o JWT Payload personalizado
interface JwtPayloadCustom extends JwtPayload {
  userId: string;
  role: keyof typeof roles; // Garante que a role seja uma das chaves do objeto roles
}

// Middleware para verificar roles com base na hierarquia
export const authorizeRole =
  (requiredRoles: (keyof typeof roles) | (keyof typeof roles)[]) =>
  (req: Request, res: Response, next: NextFunction): void => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      res.status(401).json({ message: 'Access Denied: No Authorization Header' });
      return;
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      res.status(401).json({ message: 'Access Denied: No Token Provided' });
      return;
    }

    try {
      // Decodificar o token
      const decoded = jwt.verify(token, config.secretKey as string) as unknown as JwtPayloadCustom;

      // Obter o papel do usuário do payload
      const userRole = decoded.role;

      // Converter requiredRoles para array se for uma string
      const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];

      // Verificar se o papel do usuário cumpre a hierarquia necessária para pelo menos um dos papéis requeridos
      const hasRequiredRole = roles.some(role => roleHierarchy[userRole] >= roleHierarchy[role]);

      if (!hasRequiredRole) {
        res.status(403).json({ message: 'Access Denied: Insufficient Role' });
        return;
      }

      // Anexar informações do usuário autenticado ao objeto req
      (req as any).user = decoded;

      next();
    } catch (error) {
      res.status(403).json({
        message: 'Invalid Token',
        error: (error as Error).message,
      });
    }
  };
