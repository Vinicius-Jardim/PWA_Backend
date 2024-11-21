import User from "../../models/userModel";
import Credential from "../../models/instructorCredential";
import { comparePassword, createPassword } from "../../utils/passwordUtil";
import { roles, RoleType } from "../../models/userModel";
import { createToken } from "../../utils/tokenUtil";
import { valid } from "joi";

export class AuthService {
  static async register(
    name: string,
    email: string,
    password: string,
    instructorId: string,
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

      // Determinar o papel (role) do usuário
      let givenRole: RoleType = roles.ATHLETE; // Valor padrão: "ATHLETE"
      let credential = null;
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

        // Marcar a credencial como usada
        validateCredential.isUsed = true;
        validateCredential.updatedAt = new Date();
        await validateCredential.save();

        // Atualizar o papel para "INSTRUCTOR"
        credential = validateCredential._id;
        givenRole = roles.INSTRUCTOR;

        const newUser = new User({
          name,
          email,
          password: hashPassword,
          instructorId: credential,
          role: givenRole,
        });

        await newUser.save();
        validateCredential.user = newUser._id;
        await validateCredential.save();

        const token = createToken(newUser);
        return token;
      }

      const newUser = new User({
        name,
        email,
        password: hashPassword,
        role: givenRole,
      });
      // Salvar o usuário no banco de dados
      await newUser.save();
      // Criar o token JWT para o novo usuário
      const token = createToken(newUser);
      return token; // Retorna o token e o papel do usuário
    } catch (error) {
      console.error("Error during registration:", error, { stack: error });
      return { message: "An unexpected error occurred" };
    }
  }

  static async login(email: string, password: string) {
    try {
      if (!email || !password) {
        return { message: "Email and password are required" };
      }

      const user = await User.findOne({ email });
      if (!user) {
        return { message: "User not found" };
      }

      const isMatch = await comparePassword(password, user.password);
      if (!isMatch) {
        return { message: "Invalid credentials" };
      }
      const token = createToken(user);
      return token;
    } catch (error) {
      console.error("Error during login:", error, { stack: error });
      return { message: "An unexpected error occurred" };
    }
  }
}
