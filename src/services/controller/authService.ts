import User, { IUser } from "../../models/userModel";
import Credential from "../../models/instructorCredential";
import { comparePassword, createPassword } from "../../utils/passwordUtil";
import { roles, RoleType } from "../../models/userModel";
import { createToken } from "../../utils/tokenUtil";
import jwt from "jsonwebtoken";
import { Response } from "express";
import { Schema } from "mongoose";
import { config } from "../../config";

// Função para definir o cookie de autenticação
const setAuthCookie = (res: Response, token: string) => {
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 24 * 60 * 60 * 1000, // 1 dia
  });
};

export class AuthService {
  // Registro normal para atletas
  static async register(
    name: string,
    email: string,
    password: string,
    confirmPassword: string,
    instructorId?: string
  ) {
    try {
      // Verificar campos obrigatórios
      if (!name || !email || !password) {
        throw new Error("Name, email, and password are required");
      }

      // Verificar se o usuário já existe
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        throw new Error("User already exists");
      }

      // Verificar se as senhas coincidem
      if (password !== confirmPassword) {
        throw new Error("Passwords do not match");
      }

      // Se fornecido instructorId, validar e obter o instrutor
      let instructor;
      if (instructorId) {
        instructor = await User.findById(instructorId);
        if (!instructor || instructor.role !== roles.INSTRUCTOR) {
          throw new Error("Instructor not found");
        }

        // Verificar se o instrutor já atingiu o limite de 10 alunos
        const athleteCount = await User.countDocuments({ instructorId: instructor._id });
        if (athleteCount >= 10) {
          throw new Error("This instructor has reached the maximum number of students");
        }
      }

      // Criar o hash da senha
      const hashPassword = await createPassword(password);

      // Criar o usuário como ATHLETE
      const newUser = new User({
        name,
        email,
        password: hashPassword,
        role: roles.ATHLETE,
        instructorId: instructor?._id,
      });

      await newUser.save();

      // Criar o token JWT
      const token = createToken(newUser);
      return { 
        token, 
        user: { 
          id: newUser._id, 
          name: newUser.name, 
          email: newUser.email, 
          role: newUser.role,
          instructorId: newUser.instructorId 
        } 
      };
    } catch (error) {
      throw error;
    }
  }

  // Registro específico para instrutores (apenas admin)
  static async registerInstructor(
    name: string,
    email: string,
    password: string,
    confirmPassword: string,
    instructorId: string
  ) {
    try {
      // Verificar campos obrigatórios
      if (!name || !email || !password || !instructorId) {
        throw new Error("Name, email, password and instructorId are required");
      }

      // Validar formato do instructorId (9 dígitos)
      if (!/^\d{9}$/.test(instructorId)) {
        throw new Error("Instructor ID must be 9 digits");
      }

      // Verificar se o usuário já existe
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        throw new Error("User already exists");
      }

      // Verificar se já existe uma credencial com este ID
      const existingCredential = await Credential.findOne({ instructorId });
      if (existingCredential) {
        throw new Error("Instructor ID already exists");
      }

      // Verificar se as senhas coincidem
      if (password !== confirmPassword) {
        throw new Error("Passwords do not match");
      }

      // Criar o hash da senha
      const hashPassword = await createPassword(password);

      // Criar o usuário como INSTRUCTOR
      const newUser = new User({
        name,
        email,
        password: hashPassword,
        role: roles.INSTRUCTOR,
      });

      await newUser.save();

      // Criar a credencial do instrutor
      const credential = new Credential({
        instructorId,
        user: newUser._id,
        isUsed: false
      });

      await credential.save();

      // Criar o token JWT
      const token = createToken(newUser);
      return { 
        token, 
        user: { 
          id: newUser._id, 
          name: newUser.name, 
          email: newUser.email, 
          role: newUser.role 
        },
        credential: {
          id: credential._id,
          instructorId: credential.instructorId
        }
      };
    } catch (error) {
      throw error;
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

  static async loginWithQR(qrCode: string, res: Response) {
    try {
      if (!qrCode) {
        throw new Error("QR code is required");
      }

      // Decodificar o QR code
      let qrData;
      try {
        qrData = JSON.parse(qrCode);
      } catch (error) {
        throw new Error("Invalid QR code format");
      }

      if (!qrData.token) {
        throw new Error("QR code missing token");
      }

      // Extrair ID do token
      const decodedToken = jwt.verify(
        qrData.token,
        process.env.SECRET_KEY || "supersecretkey"
      ) as any;
      const userId = decodedToken.id;

      if (!userId) {
        throw new Error("Token missing user ID");
      }

      // Procurar usuário pelo ID do token
      const user = await User.findById(userId);

      if (!user) {
        throw new Error("User not found");
      }

      // Atualizar o QR code do usuário
      user.qrCode = qrCode;
      await user.save();

      // Criar token JWT
      const token = createToken(user);

      // Definir cookie de autenticação
      setAuthCookie(res, token.token);

      return {
        message: "Login successful",
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
        },
        token: token.token,
      };
    } catch (error) {
      throw error;
    }
  }
}
