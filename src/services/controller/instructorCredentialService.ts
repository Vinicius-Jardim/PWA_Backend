import InstructorCredential from "../../models/instructorCredential";
import User from "../../models/userModel";
import { roles } from "../../models/userModel";

export class InstructorCredentialService {
  static async createInstructorCredential(userId: string) {
    try {
      // Verificar se o usuário existe e é um instrutor
      const instructor = await User.findById(userId);
      if (!instructor) {
        throw new Error("Usuário não encontrado");
      }
      if (instructor.role !== roles.INSTRUCTOR) {
        throw new Error("O usuário precisa ser um instrutor");
      }

      // Verificar se já existe uma credencial para este instrutor
      const existingCredential = await InstructorCredential.findOne({ user: userId });
      if (existingCredential) {
        throw new Error("Este instrutor já possui uma credencial");
      }

      // Gerar ID único de 9 dígitos
      const instructorId = Math.floor(100000000 + Math.random() * 900000000).toString();

      // Criar nova credencial
      const credential = new InstructorCredential({
        instructorId,
        user: userId,
        isUsed: false
      });

      await credential.save();
      return credential;
    } catch (error) {
      throw error;
    }
  }

  static async getAll(filters: any, page: number, pageSize: number) {
    try {
      const query: any = {};
      
      // Aplicar filtros
      if (filters.search) {
        query.instructorId = new RegExp(filters.search, 'i');
      }
      if (typeof filters.isUsed === 'boolean') {
        query.isUsed = filters.isUsed;
      }

      // Calcular skip para paginação
      const skip = (page - 1) * pageSize;

      // Buscar credenciais com populate do usuário
      const credentials = await InstructorCredential.find(query)
        .populate('user', 'name email')
        .skip(skip)
        .limit(pageSize)
        .sort({ createdAt: -1 });

      // Contar total para paginação
      const total = await InstructorCredential.countDocuments(query);

      return {
        credentials,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize)
      };
    } catch (error) {
      throw error;
    }
  }

  static async getById(id: string, roleUser: string, userId: string) {
    try {
      const credential = await InstructorCredential.findById(id).populate('user', 'name email');
      
      if (!credential) {
        throw new Error("Credencial não encontrada");
      }

      // Se não for admin, só pode ver sua própria credencial
      if (roleUser !== roles.ADMIN && credential.user?.toString() !== userId) {
        throw new Error("Não autorizado a ver esta credencial");
      }

      return credential;
    } catch (error) {
      throw error;
    }
  }

  static async deleteById(id: string) {
    try {
      const credential = await InstructorCredential.findById(id);
      
      if (!credential) {
        throw new Error("Credencial não encontrada");
      }

      if (credential.isUsed) {
        throw new Error("Não é possível deletar uma credencial já utilizada");
      }

      await credential.deleteOne();
      return { message: "Credencial deletada com sucesso" };
    } catch (error) {
      throw error;
    }
  }

  static async validateCredential(instructorId: string) {
    try {
      // Buscar a credencial
      const credential = await InstructorCredential.findOne({ 
        instructorId,
        isUsed: false 
      }).populate('user');

      if (!credential) {
        throw new Error("Credencial inválida ou já utilizada");
      }

      // Verificar se o instrutor já atingiu o limite de 10 alunos
      const athleteCount = await User.countDocuments({ 
        instructorId: credential.user?._id,
        role: roles.ATHLETE 
      });

      if (athleteCount >= 10) {
        throw new Error("Este instrutor já atingiu o limite máximo de 10 alunos");
      }

      return credential;
    } catch (error) {
      throw error;
    }
  }
}
