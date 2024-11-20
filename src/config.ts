import dotenv from "dotenv";

dotenv.config();

export const config = {
  // Porta para rodar o servidor
  port: process.env.PORT || 5000,

  // Conexão com o banco de dados
  mongooseConnection: process.env.DATABASE || '',

  // Chave secreta para o JWT
  secretKey: process.env.SECRET_KEY ? String(process.env.SECRET_KEY) : '',

  // Salt rounds para o bcrypt
  saltRounds: process.env.SALT_ROUNDS ? Number(process.env.SALT_ROUNDS) : 8,

  // Tempo de expiração para o JWT
  expiresIn: process.env.EXPIRES_IN || '1d', // '1d' como valor padrão
};