import * as express from "express";

// Extensão do tipo Express Request para adicionar propriedades customizadas
declare global {
  namespace Express {
    interface Request {
      roleUser: string; // The user's role (e.g., "INSTRUCTOR")
      user: { id: string; role: string }; // Store user details as an object
    }
  }
}

