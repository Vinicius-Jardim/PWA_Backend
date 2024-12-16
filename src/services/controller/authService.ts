import User, { IUser } from "../../models/userModel";
import Credential from "../../models/instructorCredential";
import { comparePassword, createPassword } from "../../utils/passwordUtil";
import { roles, RoleType } from "../../models/userModel";
import { createToken } from "../../utils/tokenUtil";
import { Response } from "express";
import { Schema } from "mongoose";

// Função para definir o cookie de autenticação
function setAuthCookie(res: Response, token: string) {
  res.cookie("auth_token", token, {
    httpOnly: true, //O cookie não fica acessível ao JavaScript no navegador
    secure: false, // quando for true, só aceita conexões HTTPS
    sameSite: "strict", // só permite que o cookie seja enviado se a requisição for do mesmo site
    maxAge: 24 * 60 * 60 * 1000,
  });
}

export class AuthService {
  static async register(
    name: string,
    email: string,
    password: string,
    instructorId: string | null,
    confirmPassword: string
  ) {
    try {
      // Verificar campos obrigatórios
      if (!name || !email || !password) {
        return { message: "Name, email, and password are required" };
      }

      // Verificar se o usuário já existe
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return { message: "User already exists" };
      }

      // Verificar se as senhas coincidem
      if (password !== confirmPassword) {
        return { message: "Passwords do not match" };
      }

      // Criar o hash da senha
      const hashPassword = await createPassword(password);

      // Inicializar os dados básicos do novo usuário
      let newUserData: Partial<IUser> = {
        name,
        email,
        password: hashPassword,
        role: roles.ATHLETE, // Valor padrão: "ATHLETE"
      };

      // Caso o `instructorId` seja fornecido, configurar como "INSTRUCTOR"
      if (instructorId) {
        const validateCredential = await Credential.findOne({
          instructorId,
          isUsed: false,
        });

        if (!validateCredential) {
          return {
            message: "Invalid instructor ID or credential already used",
          };
        }

        // Atualizar credencial como usada
        validateCredential.isUsed = true;
        validateCredential.updatedAt = new Date();
        await validateCredential.save();

        // Atualizar papel para "INSTRUCTOR" e adicionar credenciais
        newUserData = {
          ...newUserData,
          role: roles.INSTRUCTOR,
        };

        // Criar o usuário como "INSTRUCTOR"
        const newUser = new User(newUserData);
        await newUser.save();

        validateCredential.user = newUser._id;
        await validateCredential.save();

        // Criar o token JWT para o instrutor
        const token = createToken(newUser);
        return token;
      }

      // Criar o usuário como "ATHLETE" sem atributos irrelevantes
      const newUser = new User(newUserData);
      await newUser.save();

      // Criar o token JWT para o atleta
      const token = createToken(newUser);
      return token;
    } catch (error) {
      console.error("Error during registration:", error, { stack: error });
      return { message: "An unexpected error occurred" };
    }
  }

  static async login(email: string, password: string, res: Response) {
    try {
      const startTime = Date.now();

      if (!email || !password) {
        return { message: "Email and password are required" };
      }

      const findUserStart = Date.now();
      const user = await User.findOne({ email });

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const comparePasswordStart = Date.now();
      const isMatch = await comparePassword(password, user.password);

      if (!isMatch) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const createTokenStart = Date.now();
      const token = createToken(user);

      const setCookieStart = Date.now();
      setAuthCookie(res, token.token);

      return token;
    } catch (error) {
      console.error("Error during login:", error, { stack: error });
      return { message: "An unexpected error occurred" };
    }
  }
}
