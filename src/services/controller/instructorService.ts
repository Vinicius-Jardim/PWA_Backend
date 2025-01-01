import User, { roles } from "../../models/userModel";

export class InstructorService {
  // Rota protegida - retorna dados completos
  static async all(
    filters: { search?: string },
    page: number = 1,
    pageSize: number = 10
  ) {
    try {
      const searchQuery = filters.search
        ? {
            $or: [{ name: { $regex: filters.search, $options: "i" } }],
          }
        : {};

      const query = { ...searchQuery };
      const totalCount = await User.countDocuments({ ...query, role: roles.INSTRUCTOR });
      
      const instructors = await User.find({ ...query, role: roles.INSTRUCTOR })
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .exec();

      return {
        totalCount,
        instructors,
        totalPages: Math.ceil(totalCount / pageSize),
        currentPage: page,
      };
    } catch (error) {
      console.error("Error in getAll service:", error);
      throw error;
    }
  }

  // Nova rota pública - retorna apenas dados básicos
  static async getPublicList(
    page: number = 1,
    pageSize: number = 10
  ) {
    try {
      const totalCount = await User.countDocuments({ role: roles.INSTRUCTOR });
      
      const instructors = await User.find({ role: roles.INSTRUCTOR })
        .select('_id name profilePicture') // Apenas dados básicos
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .exec();

      return {
        totalCount,
        instructors,
        totalPages: Math.ceil(totalCount / pageSize),
        currentPage: page,
      };
    } catch (error) {
      console.error("Error in getPublicList service:", error);
      throw error;
    }
  }

  static async joinInstructor(id: string, userId: string) {
    try {
      const instructor = await User.findOne({
        _id: id,
        role: roles.INSTRUCTOR,
      });
      if (!instructor) {
        return { message: "Instructor not found" };
      }

      const user = await User.findOne({ _id: userId, role: roles.ATHLETE });
      if (!user) {
        return { message: "User not found" };
      }

      // Atualizar o instrutor do usuário
      await User.findByIdAndUpdate(userId, { instructorId: id });

      return { message: "Instructor joined successfully" };
    } catch (error) {
      console.error("Error in joinInstructor service:", error);
      throw error;
    }
  }

  // Criar novo instrutor com credencial
  static async createInstructor(instructorData: {
    name: string;
    email: string;
    password: string;
    credentialNumber: string;
  }) {
    try {
      // Verificar se o número de credencial já existe
      const existingInstructor = await User.findOne({
        credentialNumber: instructorData.credentialNumber,
        role: roles.INSTRUCTOR
      });

      if (existingInstructor) {
        throw new Error("Este número de credencial já está em uso");
      }

      // Criar novo instrutor
      const instructor = new User({
        ...instructorData,
        role: roles.INSTRUCTOR
      });

      await instructor.save();
      return instructor;
    } catch (error) {
      throw error;
    }
  }

  // Atualizar credencial do instrutor
  static async updateCredential(instructorId: string, newCredentialNumber: string) {
    try {
      // Verificar se o novo número já está em uso
      const existingInstructor = await User.findOne({
        credentialNumber: newCredentialNumber,
        role: roles.INSTRUCTOR,
        _id: { $ne: instructorId }
      });

      if (existingInstructor) {
        throw new Error("Este número de credencial já está em uso");
      }

      const instructor = await User.findOneAndUpdate(
        { _id: instructorId, role: roles.INSTRUCTOR },
        { credentialNumber: newCredentialNumber },
        { new: true }
      );

      if (!instructor) {
        throw new Error("Instrutor não encontrado");
      }

      return instructor;
    } catch (error) {
      throw error;
    }
  }

  // Deletar instrutor
  static async deleteInstructor(instructorId: string) {
    try {
      const instructor = await User.findOneAndDelete({
        _id: instructorId,
        role: roles.INSTRUCTOR
      });

      if (!instructor) {
        throw new Error("Instrutor não encontrado");
      }

      return instructor;
    } catch (error) {
      throw error;
    }
  }
}
