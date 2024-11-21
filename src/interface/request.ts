import * as express from "express";

declare global {
  namespace Express {
    interface Request {
      roleUser: string; // Adiciona a propriedade 'roleUser'
      user: string; // Adiciona a propriedade 'user' para armazenar o ID do usuário
    }
  }
}
