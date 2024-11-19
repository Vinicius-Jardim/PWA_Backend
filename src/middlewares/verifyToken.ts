import jwt, { JwtPayload } from "jsonwebtoken";
import config from "../config";
import { HttpStatus } from "../utils/httpStatus";
import { Request, Response, NextFunction } from "express";

// Interface para o token decodificado
interface DecodedToken extends JwtPayload {
  role: string; // Adicione outros campos relevantes do token, se necessário
  id: string;
}

// Função para verificar o token, retorna uma Promise
function Verify(token: string): Promise<DecodedToken> {
  return new Promise((resolve, reject) => {
    jwt.verify(token, config.secretKey as string, (err, decoded) => {
      if (err || !decoded) {
        console.error("Error:", err);
        return reject(err);
      }
      resolve(decoded as DecodedToken);
    });
  });
}

// Middleware para verificar o token no header de autorização
function verifyToken(req: Request & { roleUser?: string; user?: string }, res: Response, next: NextFunction): void {
  const authorize = req.header("authorization");
  const token = authorize && authorize.split(" ")[1];

  if (!token) {
    res.status(HttpStatus.BAD_REQUEST).send({ auth: false, message: "No token provided" });
    return;
  }

  Verify(token)
    .then((decoded) => {
      req.roleUser = decoded.role; // Adiciona o role ao request
      req.user = decoded.id; // Adiciona o id do usuário ao request
      next();
    })
    .catch(() => {
      res.status(HttpStatus.UNAUTHORIZED).send({
        auth: false,
        message: "Expired token or invalid token",
      });
    });
}

// Função para verificar o token em casos de redefinição de senha
async function tokenPasswordReset(token: string): Promise<boolean> {
  try {
    jwt.verify(token, config.secretKey as string);
    return true;
  } catch (error) {
    return false;
  }
}

export { verifyToken, tokenPasswordReset };
