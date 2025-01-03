import { roles, belts } from "../../models/userModel";
import User from "../../models/userModel";
import path from 'path';
import fs from 'fs';

export class UserService {
  static async me(user: any) {
    try {
      const userData = await User.findById(user.id);
      if (!userData) {
        return { message: "User not found" };
      }
      if (userData.role === roles.ATHLETE) {
        const data = {
          name: userData.name,
          email: userData.email,
          instructorId: userData.instructorId,
          belt: userData.belt,
          birthDate: userData.birthDate,
          phone: userData.phone,
          joinedDate: userData.joinedDate,
          monthlyFee: userData.monthlyFee,
          gender: userData.gender,
          avatarUrl: userData.avatarUrl,
        };
        return data;
      }
      if (userData.role === roles.INSTRUCTOR) {
        const data = {
          name: userData.name,
          email: userData.email,
          athletes: userData.athletes,
          examSchedule: userData.examSchedule,
          avatarUrl: userData.avatarUrl,
        };
        return data;
      }
      if (userData.role === roles.ADMIN) {
        const data = {
          name: userData.name,
          email: userData.email,
          role: userData.role,
          avatarUrl: userData.avatarUrl,
        };
        return data;
      }
      return userData;
    } catch (error) {
      console.error("Error fetching user data:", error, { stack: error });
      return { message: "An unexpected error occurred" };
    }
  }

  static async updateBelt(userId: string, belt: string) {
    try {
      // Validar se a faixa é válida
      if (!Object.values(belts).includes(belt)) {
        throw new Error('Faixa inválida');
      }

      // Atualizar a faixa do atleta
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { belt },
        { new: true }
      );

      if (!updatedUser) {
        throw new Error('Usuário não encontrado');
      }

      return updatedUser;
    } catch (error) {
      console.error('Erro ao atualizar faixa:', error);
      throw error;
    }
  }

  static async updateAthleteBelt(
    athleteId: string,
    newBelt: string,
    instructorId: string
  ) {
    try {
      // Verificar se o instrutor existe
      const instructor = await User.findById(instructorId);
      if (!instructor || instructor.role !== roles.INSTRUCTOR) {
        throw new Error(
          "Não autorizado: apenas instrutores podem atualizar faixas"
        );
      }

      // Verificar se o atleta existe
      const athlete = await User.findById(athleteId);
      if (!athlete || athlete.role !== roles.ATHLETE) {
        throw new Error("Atleta não encontrado");
      }

      // Verificar se a faixa é válida
      if (
        !Object.values(belts).includes(
          newBelt as (typeof belts)[keyof typeof belts]
        )
      ) {
        throw new Error("Faixa inválida");
      }

      // Atualizar a faixa do atleta
      athlete.belt = newBelt as (typeof belts)[keyof typeof belts];
      await athlete.save();

      return {
        message: "Faixa atualizada com sucesso",
        athlete: {
          id: athlete._id,
          name: athlete.name,
          belt: athlete.belt,
        },
      };
    } catch (error) {
      console.error("Erro ao atualizar faixa:", error);
      throw error;
    }
  }

  static async getAthletes(
    instructorId: string,
    page: number = 1,
    limit: number = 10
  ) {
    try {
      const instructor = await User.findById(instructorId);
      if (!instructor || instructor.role !== roles.INSTRUCTOR) {
        throw new Error(
          "Não autorizado: apenas instrutores podem listar atletas"
        );
      }

      const athletes = await User.find({
        role: roles.ATHLETE,
      })
        .select("name email belt createdAt")
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ name: 1 });

      const total = await User.countDocuments({ role: roles.ATHLETE });

      return {
        athletes,
        pagination: {
          total,
          page,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      console.error("Erro ao buscar atletas:", error);
      throw error;
    }
  }

  static async updateAvatar(userId: string, avatarUrl: string) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error("Usuário não encontrado");
      }

      // Remove old avatar file if exists
      if (user.avatarUrl) {
        const oldAvatarPath = path.join(__dirname, '../../../', user.avatarUrl);
        if (fs.existsSync(oldAvatarPath)) {
          fs.unlinkSync(oldAvatarPath);
        }
      }

      user.avatarUrl = avatarUrl;
      await user.save();
      return user;
    } catch (error) {
      console.error("Error updating avatar:", error);
      throw error;
    }
  }

  static async updateProfile(userId: string, data: { 
    name: string; 
    email: string;
    phone?: string;
    birthDate?: Date;
  }) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('Usuário não encontrado');
      }

      // Atualizar os campos permitidos
      user.name = data.name;
      user.email = data.email;
      if (data.phone) user.phone = data.phone;
      if (data.birthDate) user.birthDate = new Date(data.birthDate);

      const updatedUser = await user.save();

      // Retornar os dados baseado no papel do usuário
      if (updatedUser.role === roles.ATHLETE) {
        return {
          name: updatedUser.name,
          email: updatedUser.email,
          phone: updatedUser.phone,
          birthDate: updatedUser.birthDate,
          instructorId: updatedUser.instructorId,
          belt: updatedUser.belt,
          age: updatedUser.age,
          joinedDate: updatedUser.joinedDate,
          monthlyFee: updatedUser.monthlyFee,
          gender: updatedUser.gender,
          avatarUrl: updatedUser.avatarUrl,
        };
      }
      if (updatedUser.role === roles.INSTRUCTOR) {
        return {
          name: updatedUser.name,
          email: updatedUser.email,
          phone: updatedUser.phone,
          birthDate: updatedUser.birthDate,
          athletes: updatedUser.athletes,
          examSchedule: updatedUser.examSchedule,
          avatarUrl: updatedUser.avatarUrl,
        };
      }
      if (updatedUser.role === roles.ADMIN) {
        return {
          name: updatedUser.name,
          email: updatedUser.email,
          phone: updatedUser.phone,
          birthDate: updatedUser.birthDate,
          role: updatedUser.role,
          avatarUrl: updatedUser.avatarUrl,
        };
      }
      return updatedUser;
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      throw error;
    }
  }
}
