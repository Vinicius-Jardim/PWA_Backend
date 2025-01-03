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
          phone: userData.phone,
          birthDate: userData.birthDate,
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
          phone: userData.phone,
          birthDate: userData.birthDate,
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
    birthDate?: string | null;
  }) {
    try {
      console.log('[updateProfile] Received data:', JSON.stringify(data, null, 2));

      // Validar data de nascimento
      let birthDate = null;
      if (data.birthDate) {
        birthDate = new Date(data.birthDate);
        if (isNaN(birthDate.getTime())) {
          throw new Error('Data de nascimento inválida');
        }
      }

      // Validar telefone
      const phone = data.phone || '';
      if (phone && !/^\d{9}$/.test(phone)) {
        throw new Error('Telefone deve ter exatamente 9 dígitos');
      }

      // Preparar dados para atualização
      const updateData = {
        $set: {
          name: data.name.trim(),
          email: data.email.trim(),
          phone: phone,
          birthDate: birthDate
        }
      };

      console.log('[updateProfile] Update data:', JSON.stringify(updateData, null, 2));

      // Atualizar usuário usando findOneAndUpdate do mongoose
      const result = await User.findOneAndUpdate(
        { _id: userId },
        updateData,
        { 
          new: true,  // Retorna o documento atualizado
          runValidators: false  // Desabilita validações
        }
      ).lean();  // Converter para objeto JavaScript puro

      if (!result) {
        throw new Error('Usuário não encontrado');
      }

      console.log('[updateProfile] Updated user:', JSON.stringify(result, null, 2));

      // Retornar dados atualizados
      return {
        name: result.name,
        email: result.email,
        phone: result.phone || '',
        birthDate: result.birthDate,
        instructorId: result.instructorId,
        belt: result.belt,
        joinedDate: result.joinedDate,
        gender: result.gender
      };
    } catch (error) {
      console.error('[updateProfile] Error:', error);
      throw error;
    }
  }
}
