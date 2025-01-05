import jwt from "jsonwebtoken";
import { Document } from "mongoose";
import { config } from "../config";

// Tipo para o conteúdo decodificado do token
interface DecodedToken {
  id: string;
  role: string;
}

// Tipagem para a função de decodificação do token
const decodeToken = (token: string): Promise<DecodedToken | undefined> => {
  return new Promise((resolve, reject) => {
    // jwt.verify aceita (token, chave secreta, opções, callback)
    jwt.verify(
      token,
      config.secretKey,
      (
        err: jwt.VerifyErrors | null,
        decoded: string | jwt.JwtPayload | undefined
      ) => {
        if (err) {
          console.log("Error:", err);
          reject(new Error("Failed to authenticate"));
          return;
        }

        // Garantir que o tipo de `decoded` é DecodedToken
        if (
          decoded &&
          typeof decoded !== "string" &&
          "id" in decoded &&
          "role" in decoded
        ) {
          resolve(decoded as DecodedToken);
        } else {
          reject(new Error("Failed to decode token"));
        }
      }
    );
  });
};

// Tipagem para o modelo de usuário (ou qualquer outro modelo do Mongoose)
interface UserDocument extends Document {
  _id: string;
  role: string;
}

// Tipagem para a criação de token
const createToken = (user: UserDocument): { token: string } => {
  const token = jwt.sign(
    { id: user._id, role: user.role },
    config.secretKey,
    { expiresIn: config.expiresIn }
  );
  return { token };
};

// Tipagem para o token de reset de senha
const createTokenPasswordReset = (user: UserDocument): string => {
  return jwt.sign(
    { id: user._id },
    config.secretKey,
    { expiresIn: '1h' }
  );
};

export { decodeToken, createToken, createTokenPasswordReset };
